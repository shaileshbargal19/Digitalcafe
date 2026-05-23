CREATE TABLE IF NOT EXISTS user_seq (
    next_val bigint
) ENGINE=InnoDB;

-- Initialize the sequence value to 1 if the table is empty
INSERT INTO user_seq (next_val)
SELECT 1 FROM (SELECT 1) as temp
WHERE NOT EXISTS (SELECT 1 FROM user_seq);
