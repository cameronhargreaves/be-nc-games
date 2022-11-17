const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("GET /api", () => {
  test("200: returns the endpoints.json object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body).toMatchObject(endpoints);
      });
  });
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
      test("200: should return empty array for category that doesn't have any reviews", () => {
        return request(app)
          .get("/api/reviews?category=children's games")
          .expect(200)
          .then((result) => {
            expect((result.body.reviews.length = 0)).toBe(0);
          });
      });
    });
    describe("Limit and Page Count", () => {
      test("200: returns first 10 reviews by default", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeLessThanOrEqual(10);
          });
      });
      test("200: returns first custom number of reviews by default", () => {
        return request(app)
          .get("/api/reviews?limit=5")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeLessThanOrEqual(5);
          });
      });
      test("200: returns next 10 reviews offset by page count", () => {
        return request(app)
          .get("/api/reviews?sort_by=review_id&order=asc&limit=5&p=2")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeLessThanOrEqual(5);
            expect(result.body.reviews[0].review_id).toBe(6);
            expect(result.body.reviews[1].review_id).toBe(7);
            expect(result.body.reviews[2].review_id).toBe(8);
            expect(result.body.reviews[3].review_id).toBe(9);
            expect(result.body.reviews[4].review_id).toBe(10);
          });
      });
      test("200: should add the total_count to the output", () => {
        return request(app)
          .get("/api/reviews?sort_by=review_id&order=asc&limit=7&p=2")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeLessThanOrEqual(7);
            expect(result.body.total_count).toBe(6);
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
  describe("Pagination", () => {
    test("200: returns max 10 comments by default", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then((result) => {
          expect(result.body.comments.length).toBeLessThanOrEqual(10);
        });
    });
    test("200: returns custom amount of comments", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=2")
        .expect(200)
        .then((result) => {
          expect(result.body.comments.length).toBeLessThanOrEqual(2);
        });
    });
    test("200: returns custom amount of comments offset by a page", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=1&p=2")
        .expect(200)
        .then((result) => {
          expect(result.body.comments.length).toBeLessThanOrEqual(1);
          expect(result.body.comments[0].comment_id).toBe(4);
        });
    });
    test("400: returns error when given non number limit and page", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=one&p=two")
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
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

describe("GET /api/users", () => {
  test("200: responds with array of user objects", () => {
    return request(app)
      .get("/api/users")
      .then((result) => {
        expect(result.body.users.length > 0).toBe(true);
        result.body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
  test("404: route not found", () => {
    return request(app).get("/api/alltheusers").expect(404);
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes comment correctly", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return db.query(`SELECT COUNT(*)::INT FROM comments WHERE comment_id = 1`);
      })
      .then((res) => {
        expect(res.rows[0].count).toBe(0);
      });
  });
  test("404: comment not found", () => {
    return request(app)
      .delete("/api/comments/999999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found");
      });
  });
  test("400: bad request", () => {
    return request(app)
      .delete("/api/comments/onetwothree")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: gets a users information", () => {
    return request(app)
      .get("/api/users/mallionaire")
      .expect(200)
      .then((res) => {
        expect(res.body.user).toMatchObject({
          username: "mallionaire",
          name: "haz",
          avatar_url: "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("404: user not found", () => {
    return request(app)
      .get("/api/users/millionaire")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: patches correctly", () => {
    const newVotes = { inc_votes: 4 };
    request(app)
      .patch("/api/comments/1")
      .send(newVotes)
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          comment_id: 1,
          body: "I loved this game too!",
          review_id: 2,
          author: "bainesface",
          votes: 20,
          created_at: "2017-11-22 12:43:33.389",
        });
      });
  });
  test("400: bad comment name", () => {
    const newVotes = { inc_votes: 4 };
    request(app)
      .patch("/api/comments/hello")
      .send(newVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });

  test("400: bad votes name", () => {
    const newVotes = { inc_votes: "hello" };
    request(app)
      .patch("/api/comments/hello")
      .send(newVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });

  test("400: votes does not contain inc_votes", () => {
    const newVotes = { int_votes: 3 };
    request(app)
      .patch("/api/comments/1")
      .send(newVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("404: comment not found", () => {
    const newVotes = { inc_votes: 3 };
    request(app)
      .patch("/api/comments/4123562173836218")
      .send(newVotes)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found");
      });
  });
});

describe("POST /api/reviews", () => {
  test("201: adds a new review", () => {
    const newReview = {
      owner: "bainesface",
      title: "garbage",
      review_body: "worst thing ever",
      designer: "Uwe Rosenberg",
      category: "euro game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(201)
      .then((res) => {
        expect(res.body.review).toMatchObject({
          review_id: expect.any(Number),
          owner: "bainesface",
          title: "garbage",
          review_body: "worst thing ever",
          designer: "Uwe Rosenberg",
          category: "euro game",
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("404: given owner not in users table", () => {
    const newReview = {
      owner: "cameronhargreaves",
      title: "garbage",
      review_body: "worst thing ever",
      designer: "Uwe Rosenberg",
      category: "euro game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found");
      });
  });
  test("404: given category not in categories table", () => {
    const newReview = {
      owner: "mallionaire",
      title: "garbage",
      review_body: "worst thing ever",
      designer: "Uwe Rosenberg",
      category: "cool game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Resource not found");
      });
  });
  test("400: given undefined properties", () => {
    const newReview = {
      owner: "mallionaire",
      title: undefined,
      review_body: undefined,
      designer: undefined,
      category: "cool game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("400: missing properties", () => {
    const newReview = {
      owner: "mallionaire",
      category: "cool game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/categories", () => {
  test("201: should add a category", () => {
    const newCategory = {
      slug: "horror game",
      description: "scary spooky game",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(201)
      .then((res) => {
        expect(res.body.category).toMatchObject({
          slug: "horror game",
          description: "scary spooky game",
        });
      });
  });
  test("400: should reject category if either property is undefined", () => {
    const newCategory = {
      slug: undefined,
      description: undefined,
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("400: should reject category if either property is missing", () => {
    const newCategory = {
      description: "hello this is very cool",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/reviews/:review_id", () => {});
