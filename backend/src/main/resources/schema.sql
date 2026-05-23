CREATE TABLE IF NOT EXISTS user_seq (
    id INT AUTO_INCREMENT PRIMARY KEY,
    next_val bigint
) ENGINE=InnoDB;

-- Initialize the sequence value to 1 if the table is empty
INSERT INTO user_seq (id, next_val)
SELECT 1, 1 FROM (SELECT 1) as temp
WHERE NOT EXISTS (SELECT 1 FROM user_seq WHERE id = 1);
