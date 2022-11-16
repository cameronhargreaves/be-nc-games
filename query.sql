\c nc_games_test;
-- SELECT reviews.owner, reviews.title, reviews.review_id, 
-- reviews.created_at, counts.comment_count FROM reviews
-- LEFT JOIN (
--     SELECT review_id, COUNT(review_id) as comment_count FROM comments
-- GROUP BY review_id) as counts
-- ON counts.review_id = reviews.review_id
-- ORDER BY reviews.created_at DESC;


-- SELECT * FROM comments WHERE review_id = 2;

-- SELECT * FROM comments WHERE review_id = '2';


-- SELECT 
--   reviews.review_id, reviews.title, reviews.review_body,
--   reviews.designer, reviews.review_img_url, reviews.votes,
--   reviews.category, reviews.owner, reviews.created_at, counts.comment_count
--   FROM reviews
--   LEFT JOIN (SELECT review_id, COUNT(review_id)::INT as comment_count FROM comments
--   WHERE review_id = 6 GROUP BY review_id) as counts
--   ON reviews.review_id = counts.review_id
--   WHERE reviews.review_id = 6

-- SELECT 
--   reviews.review_id, reviews.title, reviews.review_body,
--   reviews.designer, reviews.review_img_url, reviews.votes,
--   reviews.category, reviews.owner, reviews.created_at,
--   COUNT(comments.review_id)::INT as comment_count
--   FROM reviews
--   LEFT JOIN comments ON reviews.review_id = comments.review_id
--   WHERE reviews.review_id = 4
--   GROUP BY reviews.review_id;

SELECT reviews.owner, reviews.title, reviews.review_id,
  reviews.category, reviews.review_img_url, reviews.created_at,
  reviews.votes, reviews.designer, counts.comment_count FROM reviews
  LEFT JOIN (SELECT review_id, COUNT(review_id) as comment_count FROM reviews
  GROUP BY review_id) as counts
  ON counts.review_id = reviews.review_id
  WHERE category = 'euro game'
  ORDER BY reviews.owner ASC;