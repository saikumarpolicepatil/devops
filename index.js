const express = require("express");
const db = require("./connection");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const md5 = require("md5");

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/home.html");
})
app.get("/event",(req,res)=>{
    const name = req.query.name;
    const email =req.cookies.email;
    // console.log(name);
    res.render("EventJoin",{EventName:name,email:email});
})
app.get("/club",(req,res)=>{
    const clubName = req.query.name;
    const email = req.cookies.email;
    res.render("ClubJoin",{ClubName:clubName,email:email});
})
app.get('/profile', (req, res) => {
    const email = req.cookies.email;
  
    const studentQuery = `
      SELECT
        s.name,
        s.email,
        s.usn,
        s.phone_no,
        s.branch,
        s.password
      FROM
        student s
      WHERE
        s.email = ?
    `;
  
    const clubQuery = `
      SELECT
        c.club_join_id,
        c.stud_email,
        c.club_name,
        c.name,
        c.phone,
        c.branch,
        c.year
      FROM
        club_join c
      WHERE
        c.stud_email = ?
    `;
  
    const eventQuery = `
      SELECT
        e.event_join_id,
        e.stud_email,
        e.event_name,
        e.name,
        e.phone,
        e.branch,
        e.year,
        e.event_id
      FROM
        event_join e
      WHERE
        e.stud_email = ?
    `;
  
    db.query(studentQuery, [email], (error, studentResults) => {
      if (error) {
        console.error(error);
        res.send('Error retrieving profile data');
        return;
      }
  
      db.query(clubQuery, [email], (error, clubResults) => {
        if (error) {
          console.error(error);
          res.send('Error retrieving club data');
          return;
        }
  
        db.query(eventQuery, [email], (error, eventResults) => {
          if (error) {
            console.error(error);
            res.send('Error retrieving event data');
            return;
          }
  
          const studentData = studentResults[0];
          const clubsJoined = clubResults.map(row => row.club_name);
          const eventsJoined = eventResults.map(row => row.event_name);
  
          const profileData = {
            student: studentData,
            clubsJoined: clubsJoined,
            eventsJoined: eventsJoined
          };
          res.render('profile.ejs', profileData);
        });
      });
    });
  });
  
  
app.get("/:links",(req,res)=>{
    const requestedUrl = req.params.links;
    // console.log(requestedUrl);
    if(requestedUrl==="loginpage") res.sendFile(__dirname+"/loginpage.html")
    else if(requestedUrl=="Protocolhome") res.sendFile(__dirname+"/Protocolhome.html");
    else if(requestedUrl=="IEEEhome") res.sendFile(__dirname+"/IEEEhome.html");
    else if(requestedUrl=="registrationpage") res.sendFile(__dirname+"/registrationpage.html");
    else if(requestedUrl==="after_login") res.sendFile(__dirname+"/after_login.html");
})
app.post("/userLogin",(req,res)=>{
    const {mail, pass} = req.body;
    res.cookie('email',mail);
    var selectUser = "SELECT * FROM student WHERE email=?";
    db.query(selectUser,[mail],(err,results)=>{
        if(err) throw err;
        if(results.length===0) res.render("loginpage",{msg:"Email Id not found"})
        else if(results[0].password != md5(pass)) res.render("loginpage",{msg:"Wrong Credentials"});
        else res.redirect("/after_login");
    })
})
app.post("/Registration",(req,res)=>{
    const name = req.body.name;
    const usn = req.body.USN;
    const email = req.body.email;
    const phone =  req.body.phoneNumber;
    const branch = req.body.Branch;
    const password = md5(req.body.pwd);
    var checkEmail = 'SELECT * FROM student WHERE email=?';
    db.query(checkEmail,[email],(err,results)=>{
        if(err) throw err;
        if(results.length>0) res.render("registrationpage",{msg:"Email exists alredy",std:results});
        else 
        {
            var insertStd = "INSERT INTO student values(?,?,?,?,?,?)";
            db.query(insertStd,[name,email,usn,phone,branch,password],(error,result)=>{
                if(error) throw error;
                res.redirect("/loginpage");
            })
        }
    })
})
app.post("/joinEvent", (req, res) => {
    const { eventName, Name, email, phone, Branch, Year } = req.body;
    
    var selectEventId = "SELECT * from events WHERE event_name =?";
    db.query(selectEventId,[eventName],(selectEventErr,selectEventResult)=>{
        if(selectEventErr) throw selectEventErr;
        const checkRegistered = "SELECT * FROM event_join WHERE stud_email=? AND event_id=?";
        db.query(checkRegistered, [email, selectEventResult[0].event_id], (err, checkResults) => {
            if (err) throw err;
            if (checkResults.length > 0) {
                res.send("You have already registered for this event");
            } else {
                const getEventIdQuery = "SELECT event_id FROM events WHERE event_name=?";
                db.query(getEventIdQuery, [eventName], (err, eventResults) => {
                    if (err) throw err;
    
                    if (eventResults.length === 0) {
                        res.send("Event not found");
                    } else {
                        var eventId = eventResults[0].event_id;
                        const insertStdForEvent = "INSERT INTO event_join (stud_email, event_name ,name, phone, branch, year, event_id) VALUES (?, ?,?, ?, ?, ?, ?)";
                        db.query(insertStdForEvent, [email, eventName,Name, phone, Branch, Year, eventId], (err, insertResult) => {
                            if (err) throw err;
                            
                            res.redirect("/after_login")
                        });
                    }
                });
            }
        });
    })
});
app.post("/joinClub",(req,res)=>{
    const {clubName,Name,email,phone,Branch,Year} = req.body;
    var checkStd = "SELECT * FROM club_join WHERE stud_email=? and club_name=?";
    db.query(checkStd,[email,clubName],(err,checkRes)=>{
        if(err) throw err;
        if(checkRes.length>0) res.send("You have already joined this club");
        else 
        {
            var insertStd = "INSERT INTO club_join(stud_email,club_name,name,phone,branch,year) values (?,?,?,?,?,?)";
            db.query(insertStd,[email,clubName,Name,phone,Branch,Year],(insertErr,insertRes)=>{
                if(insertErr) throw insertErr;
                res.redirect("/after_login");
            })
        }
    })
})
app.listen(3000,()=>console.log(`Server running on port 3000`));