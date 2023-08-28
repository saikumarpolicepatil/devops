create database clubs;
use clubs;
create table student(
	name text, 
    email varchar(100) primary key,
    usn varchar(15),
    phone_no bigint,
    branch varchar(30), 
    password text
);
create table club(
	club_id  int primary key auto_increment,
	club_name varchar(40) unique
);
create table club_join(
	club_join_id int primary key auto_increment,
    stud_email varchar(100),
    club_name varchar(40),
    name text,
	phone bigint,
    branch varchar(30),
    year int,
    FOREIGN KEY (stud_email) REFERENCES student(email)on delete cascade on update cascade,
    foreign key (club_name) references club(club_name) on delete cascade on update cascade
);
create table events(
	event_id int primary key auto_increment,
    event_name varchar(60) UNIQUE , 
    club_name varchar(40) ,
    foreign key(club_name) references club(club_name) on delete cascade on update cascade
);
create table event_join(
	event_join_id int primary key auto_increment,
    stud_email varchar(100),
    event_name varchar(40),
    name text,
	phone bigint,
    branch varchar(30),
    year int,
    event_id int,
    FOREIGN KEY (stud_email) REFERENCES student(email)on delete cascade on update cascade,
    FOREIGN KEY (event_id) REFERENCES events(event_id) on delete cascade on update cascade,
    foreign key (event_name) references events(event_name) on delete cascade on update cascade
);
INSERT INTO club(club_name) values('PROTOCOL'),('IEEE');
INSERT INTO events (event_name, club_name) VALUES ('Clash of Coders', 'PROTOCOL'),
	('Protocol Day', 'PROTOCOL')
,('Introduction to Cyber Security', 'PROTOCOL')
 ,('LinkedIn 101', 'IEEE')
,('BITS', 'IEEE')
 ,('CYMAPLOG', 'IEEE');