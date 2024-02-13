drop table if exists destinations cascade;
drop table if exists reviews cascade;
drop table if exists users cascade;

create table users (
	userId serial primary key,
	email varchar(100) unique,
	fullName varchar(100),
	nickname varchar(100) unique,
	userPassword varchar(100)
);

create type category as enum ('mare', 'munte', 'balnear');
create table destinations (
	destinationId serial primary key,
	destinationName varchar(100),
	destinationCategory category,
	coordinates point
);

create table reviews (
	reviewId serial primary key,
	authornickname varchar(100) references users(nickname),
	reviewCategory category,
	reviewBody text,
	rating integer,
	upvotes integer,
	dateposted timestamp,
	destinationId serial references destinations(destinationId)
);