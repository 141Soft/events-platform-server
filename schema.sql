CREATE DATABASE IF NOT EXISTS eventsPlatform;

USE eventsPlatform;

DROP TABLE IF EXISTS events, eventTags, eventImages, eventParticipants, users;

CREATE TABLE IF NOT EXISTS events (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    eventName VARCHAR(100) NOT NULL,
    eventDate DATETIME NOT NULL,
    eventDesc TEXT NOT NULL,
    eventStub TEXT NOT NULL,
    eventThumb VARCHAR(100) NOT NULL,
    eventDuration INT NOT NULL
);

CREATE TABLE IF NOT EXISTS eventTags (
    eventID INT NOT NULL,
    eventTag VARCHAR(20) NOT NULL,
    PRIMARY KEY(eventID, eventTag)
);

CREATE TABLE IF NOT EXISTS eventImages (
    eventID INT NOT NULL,
    imgurl VARCHAR(100) NOT NULL,
    PRIMARY KEY(eventID, imgurl)
);

CREATE TABLE IF NOT EXISTS eventParticipants (
    eventID INT NOT NULL,
    userEmail VARCHAR(100) NOT NULL,
    PRIMARY KEY(eventID, userIP)
);

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userEmail VARCHAR(100) NOT NULL,
    userName VARCHAR(100) NOT NULL,
    userPassword VARCHAR(100) NOT NULL,
    isVerified INT NOT NULL,
    isAdmin INT NOT NULL
);