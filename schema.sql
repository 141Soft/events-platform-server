CREATE DATABASE IF NOT EXISTS eventsPlatform;

USE eventsPlatform;

DROP TABLE IF EXISTS events, eventTags, eventImages;

CREATE TABLE IF NOT EXISTS events (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    eventName VARCHAR(100) NOT NULL,
    eventDate DATETIME NOT NULL,
    eventDesc TEXT NOT NULL,
    eventStub TEXT NOT NULL,
    eventThumb VARCHAR(100) NOT NULL
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