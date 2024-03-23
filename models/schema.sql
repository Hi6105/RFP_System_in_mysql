USE rfp_system;

CREATE TABLE company (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE otp (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp INT NOT NULL
);

CREATE TABLE rfp_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    category_status VARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (company_id) REFERENCES company(company_id) -- company_id is a foreign key referencing the company table's company_id
);

CREATE TABLE rfp_user_details (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Password is Hased before storing
    user_type VARCHAR(255) NOT NULL,
    company_id INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) -- company_id is a foreign key referencing the company table's company_id
);

CREATE TABLE rfp_vendor_details (
    user_id INT PRIMARY KEY,
    revenue DECIMAL(10, 2) NOT NULL,
    number_of_employees INT NOT NULL,
    GST_no VARCHAR(15) NOT NULL UNIQUE,
    PAN VARCHAR(10) NOT NULL UNIQUE,
    phone_number VARCHAR(10) NOT NULL,
    category_id INT NOT NULL,
    vendor_status VARCHAR(255) DEFAULT 'Rejected',
    image_path VARCHAR(255),  --  only store the path to the image
    image_name VARCHAR(255),   --  only store the name of the image
    FOREIGN KEY (category_id) REFERENCES rfp_categories(category_id), -- category_id is a foreign key referencing the rfp_category table's category_id
    FOREIGN KEY (user_id) REFERENCES rfp_user_details(user_id) -- rfp_users_details table exists with user_id as primary key
);

CREATE TABLE rfp_list (
    rfp_no INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL,
    last_date DATE NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    FOREIGN KEY (company_id) REFERENCES company(company_id) -- company_id is a foreign key referencing the company table's company_id
);

CREATE TABLE vendor_map_rfp_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfp_no INT NOT NULL,
    user_id INT NOT NULL,
    applied BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (rfp_no) REFERENCES rfp_list(rfp_no),  -- rfp_no is a foreign key referencing rfp_list table's rfp_no
    FOREIGN KEY (user_id) REFERENCES rfp_user_details(user_id) -- rfp_users_details table exists with user_id as primary key
);

CREATE TABLE rfp_quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    rfp_no INT NOT NULL,
    user_id INT NOT NULL,
    vendor_price DECIMAL(10, 2) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id),  -- company_id is a foreign key referencing the company table's company_id
    FOREIGN KEY (rfp_no) REFERENCES rfpList(rfp_no),  -- rfp_no is a foreign key referencing the rfp_list table's rfp_no
    FOREIGN KEY (user_id) REFERENCES rfpUserDetails(user_id) -- rfp_user_details table exists with user_id as primary key
);
