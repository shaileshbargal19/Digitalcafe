-- Auto-approve all existing CUSTOMER accounts that are still PENDING
UPDATE users SET status = 'APPROVED' WHERE role = 'CUSTOMER' AND status = 'PENDING';
