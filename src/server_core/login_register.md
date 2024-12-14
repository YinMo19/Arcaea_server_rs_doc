# 注册/登陆

这一部分非常重要。如果不想要让用户随意的创建账号，那么我们需要小心谨慎。

## 注册

注册接口 


注册账号有几种方案：

- 直接通过
- 通过邮件验证
- 实现一个请求列表、管理员在后台通过
- 第二点和第三点同时实现

我们预计将会实现这几个功能。启用这些功能通过寻找环境变量判断。如果服务器启动时在环境变量中找到关于邮件服务器的配置，那么将会启用邮件功能。

预计使用 lettre crate 实现邮件服务。用户需要在环境变量中设置

```
ARCSERVER_ADMIN_MAIL=M<your mail>
ARCSERVER_MAIL_SMTP_SERVER=<your smtp server>
ARCSERVER_MAIL_PASSWORD=<password>
```

当这三个参数同时检测到的时候才会启动邮件服务。在官方案例中

```rs
extern crate lettre;
extern crate lettre_email;
extern crate mime;

use lettre_email::Email;
use lettre::smtp::authentication::Credentials;
use lettre::{SmtpClient, Transport};

fn main() {

    let email_receiver = "YOUR_TARGET_EMAIL";
    let mine_email = "YOUR_GMAIL_ADDRESS";
    let smtp_server = "smtp.gmail.com";
    let password = "YOUR_GMAIL_APPLICATION_PASSWORD"; //需要生成应用专用密码

    let email = Email::builder()
        .to(email_receiver)
        .from(mine_email)
        .subject("subject")
        .html("<h1>Hi there</h1>")
        .text("Message send by lettre Rust")
        .build()
        .unwrap();

    let creds = Credentials::new(
        mine_email.to_string(),
        password.to_string(),
    );

    // Open connection to Gmail
    let mut mailer = SmtpClient::new_simple(smtp_server)
        .unwrap()
        .credentials(creds)
        .transport();

    // Send the email
    let result = mailer.send(email.into());

    if result.is_ok() {
        println!("Email sent");
    } else {
        println!("Could not send email: {:?}", result);
    }

    print!("{:?}", result);
    mailer.close();
}
```

可以看到邮件收发并不困难。

邮件发送内容会是一个 url，它应该类似于

```
https://<your_domain(:port)>/<api_endpoint>/auth?auth_string=<random_string>
```

这个随机字符串在用户注册的时候生成，并储存在用户信息中。服务器在接受到这个请求之后查询数据库，判断这个字符串是否存在、是否在规定时间内，以此实现验证。

管理员后台验证应该是默认启用的模式。如果要实现没有任何验证（这应该是别的功能测试的时候使用的，非常不建议正式使用）应该使用环境变量

```
ARCSERVER_NO_ADMIN_AUTH=true
```

来指定。否则在管理员页面将会显示一个表单，可以看到目前注册是否通过。

用户注册之后，数据库填入的字段有

```
user_id,
name,
password,
join_date,
user_code,
rating_ptt,
highest_rating_ptt,
character_id,
is_skill_sealed,
is_char_uncapped,
is_char_uncapped_override,
is_hide_rating,
favorite_character,
max_stamina_notification_enabled,
current_map,
ticket,
prog_boost,
email
```

### 相关接口
注册接口
```
('user/', methods=['POST'])
```
邮箱验证进度查询
```
('auth/verify', methods=['POST'])
```
邮箱验证重发
```
('user/email/resend_verify', methods=['POST']) 
```
删除账号
```
('user/me/request_delete', methods=['POST']) 
```

## 登陆
登陆接口
```
('auth/login', methods=['POST'])
```

需要实现的功能有
- 验证客户端版本号
- 验证设备信息
- 查验 ip 地址
  - 多端登陆自动封号
- 验证账号密码
- ...

返回字段有

```json
{
    "success": True,
    "token_type": "Bearer", 
    "user_id": user.user_id, 
    "access_token": user.token
}
```
