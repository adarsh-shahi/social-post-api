# Social Post API
## _Follows REST design pattern_
#

 ![](https://img.shields.io/badge/release-v1.0-blue)
## Features 

- User creates a post with one image and a caption
- Can comment on a post
- Can like posts and comments under a post
- Visit other user's profile and self profile

> The overriding purpose of this  project
> is to learn http module to create API.
> And aslo gain a confidence using PostgreSQL
> getting some hands dirty with SQL queries
> You can refer these code and can also suggest 
> some improvements.


## Tech

- Vanilla NodeJS - Creating REST API's
- PostgreSQL - Database hosted on AWS
- [node-postgress](https://node-postgres.com/) - Postgres Client.

# Table of Contents

1. Database Schema
2. API Endpoints

#### Database Schema

1. Users Table

```sql
    CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	username VARCHAR(50) NOT NULL UNIQUE,
	bio VARCHAR(240),
	email VARCHAR(30) NOT NULL UNIQUE,
	password VARCHAR(50) NOT NULL
);
```

2. Posts Table

```sql
CREATE TABLE posts(
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	url VARCHAR(240) NOT NULL,
	caption VARCHAR(500) NOT NULL,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

3. Comments Table
```sql
CREATE TABLE comments(
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	contents VARCHAR(240) NOT NULL,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE
);
```

4. Likes Table
```sql
CREATE TABLE likes(
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
	comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
	UNIQUE(user_id, post_id, comment_id),
	CHECK(
		COALESCE((post_id)::BOOLEAN::INTEGER,0)
		+
		COALESCE((comment_id)::BOOLEAN ::INTEGER,0)
		= 1
	)
);
```

5. Followers Table
```sql
CREATE TABLE followers(
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	leader_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE(leader_id, follower_id)
);
```
#
#
#
#### API Endpoints
_work in progress......_

## License

MIT

**Free Software, Hell Yeah!**