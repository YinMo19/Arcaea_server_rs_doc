# 论坛

小论坛会挂在相同的网页上，作为一个子功能。目前我已有一个相似的项目 [Chatroom](https://github.com/YinMo19/Chatroom) 。

核心的实现思路是，在用户第一次访问的时候获取历史信息（并缓存），之后点入特定的论坛，会获取一个 `EventStream`，这个事件流订阅了一个消息队列，这个消息队列的所有新增消息会实时的 `Send` 给用户，实现一个简单的通讯功能。

```rs
use super::database::MessageLog;
use super::models::Message;
// use super::utils::DateTimeWrapper;
use rocket::form::Form;
use rocket::response::stream::{Event, EventStream};
use rocket::serde::json::Json;
use rocket::tokio::select;
use rocket::tokio::sync::broadcast::{error::RecvError, Sender};
use rocket::{Shutdown, State};
use rocket_db_pools::Connection;
use std::net::IpAddr;

#[get("/events")]
pub async fn events(queue: &State<Sender<Message>>, mut end: Shutdown) -> EventStream![] {
    let mut rx = queue.subscribe();
    EventStream! {
        loop {
            let msg = select! {
                msg = rx.recv() => match msg {
                    Ok(msg) => msg,
                    Err(RecvError::Closed) => break,
                    Err(RecvError::Lagged(_)) => continue,
                },
                _ = &mut end => break,
            };

            yield Event::json(&msg);
        }
    }
}

#[post("/message", data = "<form>")]
pub async fn post(
    mut db: Connection<MessageLog>,
    form: Form<Message>,
    queue: &State<Sender<Message>>,
    client_ip: Option<IpAddr>,
) {
    // println!("New message from {:?}", client_ip);
    let message = form.into_inner();
    let _res = queue.send(message.clone());

    let query = r#"
        INSERT INTO messages (room, username, message, ip_addr)
        VALUES (?, ?, ?, ?)
    "#;

    let _result = sqlx::query(&query)
        .bind(&message.room)
        .bind(&message.username)
        .bind(&message.message)
        .bind(&client_ip.unwrap().to_string())
        .fetch_all(&mut **db)
        .await
        .expect("Failed to insert message");
}

#[get("/history?<room>")]
pub async fn get_history(
    mut db: Connection<MessageLog>,
    room: String,
) -> Result<Json<Vec<Message>>, rocket::response::status::Custom<String>> {
    let query = r#"
        SELECT * FROM messages WHERE room = ? ORDER BY id DESC LIMIT 500
    "#;

    let mut messages = sqlx::query_as(&query)
        .bind(room)
        .fetch_all(&mut **db)
        .await
        .map_err(|e| {
            rocket::response::status::Custom(
                rocket::http::Status::InternalServerError,
                format!("Database error: {}", e),
            )
        })?;

    messages.reverse();
    Ok(Json(messages))
}
```

这是之前已经实现的一些内容，可以简单的参考。

关于用户鉴权方面，直接使用核心数据库中的用户信息即可。用户鉴权方面应该放在网页端入口处实现，论坛发送消息时应该再次校验。
