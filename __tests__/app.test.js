const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("GET /api/categories", () => {
  test("200: should respond with category information", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((result) => {
        expect(result.body.categories.length > 0).toBe(true);
        result.body.categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("404: route not found", () => {
    return request(app)
      .get("/api/category")
      .expect(404)
      .then((result) => {
        expect(result.body).toMatchObject({
          msg: "Route not found",
        });
      });
  });
});

describe("GET /api/reviews", () => {
  test("200: should respond with review information", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.length > 0);
        result.body.reviews.forEach((category) => {
          expect(category).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("200: should respond with reviews ordered by date descending by default", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.body.reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  describe("Queries", () => {
    describe("Sort_By", () => {
      test("200: should sort by given column", () => {
        return request(app)
          .get("/api/reviews?sort_by=title")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("title", { descending: true });
          });
      });
      test("400: should reject columns that arent in the DB", () => {
        return request(app)
          .get("/api/reviews?sort_by=randomcolumnname")
          .expect(400)
          .then((result) => {
            expect(result.body.msg).toBe("Bad Request");
          });
      });
    });
    describe("Order", () => {
      test("200: should order by ascending", () => {
        return request(app)
          .get("/api/reviews?order=asc")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("created_at");
          });
      });
      test("200: should order by descending", () => {
        return request(app)
          .get("/api/reviews?order=desc")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("200: should default to descending given an invalid argument", () => {
        return request(app)
          .get("/api/reviews?order=AnyOrderPlease")
          .expect(400)
          .then((result) => {
            expect(result.body.msg).toBe("Bad Request");
          });
      });
    });
    describe("Category", () => {
      test("200: should return reviews with a given category", () => {
        return request(app)
          .get("/api/reviews?category=euro game")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length > 0).toBe(true);
            result.body.reviews.forEach((category) => {
              expect(category).toMatchObject({
                owner: expect.any(String),
                title: expect.any(String),
                review_id: expect.any(Number),
                category: "euro game",
                review_img_url: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                designer: expect.any(String),
                comment_count: expect.any(String),
              });
            });
          });
      });
      test("404: should reject category for invalid category name", () => {
        return request(app)
          .get("/api/reviews?category=silly game")
          .expect(404)
          .then((result) => {
            expect(result.body.msg).toBe("Resource not found");
          });
      });
      test.only("200: should return empty array for category that doesn't have any reviews", () => {
        return request(app)
          .get("/api/reviews?category=children's games")
          .expect(200)
          .then((result) => {
            expect((result.body.reviews.length = 0)).toBe(0);
          });
      });
    });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: should respond with a single review information", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 1,
          title: "Agricola",
          category: "euro game",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_body: "Farmyard fun!",
          review_img_url: "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          created_at: "2021-01-18T10:00:20.514Z",
          votes: 1,
          comment_count: 0,
        });
      });
  });
  test("200: should respond with correct comment count", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 2,
          title: expect.any(String),
          category: expect.any(String),
          designer: expect.any(String),
          owner: expect.any(String),
          review_body: expect.any(String),
          review_img_url: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          comment_count: 3,
        });
      });
  });
  test("404: review not found", () => {
    return request(app)
      .get("/api/reviews/112312831273821787")
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Review Not Found");
      });
  });
  test("400: bad input", () => {
    return request(app)
      .get("/api/reviews/onetwothree")
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("200: should return object of comments", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((result) => {
        expect(result.body.comments.length > 0).toBe(true);
        result.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: expect.any(Number),
          });
        });
      });
  });
  test("200: returns empty array for no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then((result) => {
        expect(result.body).toMatchObject({ comments: [] });
      });
  });
  test("404: comments not found", () => {
    return request(app)
      .get("/api/reviews/99999/comments")
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("400: bad request", () => {
    return request(app)
      .get("/api/reviews/helllooooo/comments")
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("201: Item added successfully", () => {
    const newComment = {
      username: "mallionaire",
      body: "worst thing ive ever played",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then((result) => {
        expect(result.body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          review_id: expect.any(Number),
        });
      });
  });
  test("201: Item added successfully and ignores extra properties", () => {
    const newComment = {
      username: "mallionaire",
      body: "worst thing ive ever played",
      random_property: "hellooooooooo",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then((result) => {
        expect(result.body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          review_id: expect.any(Number),
        });
      });
  });
  test("404: bad input for incorrect username", () => {
    const newComment = {
      username: "cameronhargreaves",
      body: "worst thing ive ever played",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("404: bad input for incorrect id type", () => {
    const newComment = {
      username: "cameronhargreaves",
      body: "worst thing ive ever played",
    };
    return request(app)
      .post("/api/reviews/hellothere/comments")
      .send(newComment)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("404: review not found", () => {
    const newComment = {
      username: "mallionaire",
      body: "worst thing ive ever played",
    };
    return request(app)
      .post("/api/reviews/999999999/comments")
      .send(newComment)
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("404: no body given", () => {
    const newComment = {
      body: "worst thing ive ever played",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("400: bad request", () => {
    const newComment = {
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("200: should update votes addition succesfully", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/reviews/1")
      .send(updateVotes)
      .expect(200)
      .then((result) => {
        expect(result.body.review.votes).toBe(2);
      });
  });
  test("200: should update votes subtraction succesfully", () => {
    const updateVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/reviews/1")
      .send(updateVotes)
      .expect(200)
      .then((result) => {
        expect(result.body.review.votes).toBe(-99);
      });
  });
  test("400: bad request for non-number updated value", () => {
    const updateVotes = { inc_votes: "hellooooooooo" };
    return request(app)
      .patch("/api/reviews/1")
      .send(updateVotes)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("404: review not found", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/reviews/9999999")
      .send(updateVotes)
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("400: bad request when inc_votes not given", () => {
    const updateVotes = { add_the_votes: 1 };
    return request(app)
      .patch("/api/reviews/9999999")
      .send(updateVotes)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("400: bad request when invalid id given", () => {
    const updateVotes = { add_the_votes: 1 };
    return request(app)
      .patch("/api/reviews/helloooooooo")
      .send(updateVotes)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
});
