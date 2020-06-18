const mysql = require('mysql');
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

var userid = 5;
var bookid = 5;

var app = express();

app.set('view engine' , 'ejs');

app.use('/assets', express.static('assets'));

app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static("public"));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, req.body.book_id + '.' + 'png')
    }
  });
   
var upload = multer({ storage: storage });

var mysqlConnection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'new_Sem4_Project',
    multipleStatements : true
});

mysqlConnection.connect((err)=>{
    if(!err)
    {
        console.log('Connected');
    }
    else
    {
        console.log('Connection failed \n Error :' + JSON.stringify(err,undefined,2));
    }
});

var msg = {
    email : "",
    password : ""
};

var book_id_from_cart;
var user_id_logged;
var myFunction = function (data) {
    console.log('inside');
    console.log(data);
    book_id_from_cart = data;
    console.log(book_id_from_cart);
}

// GET requests

app.get('/',function(req, res){
    res.render('login.ejs', {msg: msg});
});

app.get('/SignUp',function(req, res){
    res.render('SignUp.ejs');
});


app.get('/dsa',function(req, res){
    mysqlConnection.query('Select * from new_Sem4_Project.book where subject_code = ?',
        ['DSA'], function(err, result, fields){
            if(err) throw err;
            res.render('dsa',{container: result});
        })
})

app.get('/os',function(req, res){
    mysqlConnection.query('Select * from new_Sem4_Project.book where subject_code = ?',
    ['OS'], function(err, result, fields){
        if(err) throw err;
        res.render('os',{container: result});
    })
})

app.get('/dbs',function(req, res){
    mysqlConnection.query('Select * from new_Sem4_Project.book where subject_code = ?',
        ['DBS'], function(err, result, fields){
            if(err) throw err;
            res.render('dbs',{container: result});
        })
})

app.get('/ccn',function(req, res){
    mysqlConnection.query('Select * from new_Sem4_Project.book where subject_code = ?',
    ['CCN'], function(err, result, fields){
        if(err) throw err;
        res.render('ccn',{container: result});
    })
})

app.get('/wta',function(req, res){
    mysqlConnection.query('Select * from new_Sem4_Project.book where subject_code = ?',
    ['WTA'], function(err, result, fields){
        if(err) throw err;
        res.render('wta',{container: result});
    })
})

app.get('/acd',function(req, res){
    mysqlConnection.query('Select * from new_Sem4_Project.book where subject_code = ?',
    ['ACD'], function(err, result, fields){
        if(err) throw err;
        res.render('acd',{container: result});
    })
})


app.get('/admin', function(req, res){
       
        res.render('admin.ejs');
});

app.get('/addBook', function(req, res){
    res.render('addBook.ejs');
})

app.get('/wtafrontpage', function(req, res){
    res.render('wtafrontpage.ejs');
})

app.get('/myaccount', function(req, res){
    console.log('Entered myaccount');
    var val = userid;
    mysqlConnection.query('Select * from new_Sem4_Project.purchase_table where uid = ?',
        [val], function(err, result, fields){
            if(err) throw err;
            res.render('myaccount',{myaccount: result});
        })
})

app.get('/cart', function(req, res){
    console.log('Entered cart');
    var val = userid;
    mysqlConnection.query('Select * from new_Sem4_Project.cart where uid = ?',
        [val], function(err, result, fields){
            if(err) throw err;
            console.log(result);
            mysqlConnection.query('select sum(price_of_book*no_of_books) as total_price from new_Sem4_Project.cart where uid = ?',
                [val], function(err2, result2, fields2){
                    if(err2) throw err2;
                    console.log('result2');
                    console.log(result2);
                    res.render('cart',{cart: result, total: result2[0].total_price});
        })
})
})

app.get('/proceed', function(req, res){
    res.render('proceed.ejs');
})

//  POST requests

app.post('/proceed', urlencodedParser, function(req, res){
    console.log('Proceed to buy');
    var value = userid;
    mysqlConnection.query('select * from new_Sem4_Project.cart where uid = ?',
        [value], function(err, result ,fields){
            if(result.length == 0){
                res.send('There are no books in your cart');
                console.log('No books in cart');
            }
            else{
                var i;
                for(i = 0; i < result.length; i++)
                {
                    var values2 = {
                        uid : userid,
                        bid : result[i].bid,
                        book_name : result[i].bookname,
                        book_author : result[i].bookauthor,
                        no_of_books : result[i].no_of_books,
                        purchase_time : new Date().toISOString().slice(0, 10)+" "+new Date().toLocaleTimeString('en-GB')
                    }
                    
                    mysqlConnection.query('select Availability from new_Sem4_Project.Book where Book_name = ? and book_author = ?',
                        [values2.book_name, values2.book_author], function(err, result, fields){
                            if(err) throw err;
                            if(values2.no_of_books == result[0]){
                                mysqlConnection.query('delete from new_Sem4_Project.Book where Book_name = ? and book_author = ?',
                                    [values2.book_name, values2.book_author], function(err,result, fields){
                                        if(err) throw err;
                                        else{
                                            console.log('1 record deleted from Books table');
                                        }
                                    })
                            }
                            else if(result[0] < values2.no_of_books){
                                res.send('No Enough books');
                                console.log('no enouh books');
                            }
                            else{
                                mysqlConnection.query('update new_Sem4_Project.Book set Availability = (Availability - 1) where Book_name = ? and book_author = ?',
                                    [values2.no_of_books, values2.bookname, values2.bookauthor], function(err, result, fields){
                                        if(err) throw err;
                                        else{
                                            console.log('updated one record');
                                        }
                                    })

                            }
                        })
                    mysqlConnection.query('Insert into new_Sem4_Project.purchase_table set ?',
                        [values2], function(err, result, fields){
                            if(err) throw err;
                            console.log('record entered');
                        })
                }
            }
        })
})

app.post('/delaction', urlencodedParser, function(req, res){
    console.log('Inside Delete Page');

    mysqlConnection.query("SELECT * FROM new_Sem4_Project.Book WHERE Book_name = ? and book_author=?",
                                    [req.body.delbookname,req.body.delbookauthor], function (err, result, fields) {
                if (err) throw err;
                console.log(result);

                if(result.length > 0){
                    if(result[0].addedby == userid){
                    if(result[0].Availability == 1){
                    mysqlConnection.query("DELETE FROM new_Sem4_Project.Book where Book_name = ? and book_author=?",
                        [req.body.delbookname,req.body.delbookauthor], function(err, result, fields){
                            if (err) throw err;
                            console.log('Book deleted');
                            res.send('Book Deleted');
                        })}
                    else if(result[0].Availability >= 2){
                        mysqlConnection.query("Update Book set Availability=(Availability-1) where Book_name = ? and book_author=?",
                            [req.body.delbookauthor], function(err, result, fields){
                                if(err) throw err;
                                console.log('Book deleted');
                                res.send('Deleted and updated');
                            })
                    }
            }
                    else{
                        console.log('no access');
                        res.send('No access to the book');
                    }
                }
                else{
                    res.send('Book not found in the database');
                    if (err) throw err;
                    console.log('Wrong information entered')
                }
            })
})

app.post('/searchaction', urlencodedParser, function(req, res){
    console.log('Inside Search Page');
    
    mysqlConnection.query("SELECT book_id FROM new_Sem4_Project.Book WHERE Book_name = ?",
                                    [req.body.searchbookname], function (err, result, fields) {
                if (err) throw err;
                
                console.log(result);
                
                if(result.length > 0)
                {
                        
                        res.send('Book in the database');
                        if(err) throw err;
                        console.log('Book found');
                }

                else
                {
                    res.send('Book not in the database');
                    if(err) throw err;
                    console.log('Book not found');
                        
                }    
            });

})


app.post('/addBook', urlencodedParser, upload.single('image'), function(req, res) {
    
    console.log('inside post');
    console.log(req.file);
    console.log(req.body);
    
    var loc = __dirname + '/' + req.body.file.path;
    console.log(loc);

    if(req.body.bookname)
        {
            var values3 = {
                Book_name: req.body.bookname, 
                book_author: req.body.bookauthor, 
                Image: fs.readFileSync(loc),
                Image : req.query.file,
                Description: req.body.desc, 
                Price: req.body.bookprice, 
                Availability: '1',
                subject_code: req.body.subcode,
                addedby : userid
            };
             
            mysqlConnection.query("SELECT * FROM `new_Sem4_Project`.`Book` WHERE Book_name = ? AND  book_author = ? and addedby = ?",
                                    [values3.Book_name, values3.book_author, values3.addedby], function (err, result, fields) {
                if (err) throw err;
                
                console.log(result);
                
                if(result.length > 0)
                {
                    mysqlConnection.query("UPDATE `Book` SET Availability = (Availability + 1) WHERE Book_name = ?", 
                                            [values3.Book_name], function (err, result, fields) {
                        if(err) throw err;
                        console.log(result);
                    })

                }
                else
                {
                    console.log(values3);
                    var sql = "INSERT INTO `new_Sem4_Project`.`Book` SET ?";
                    mysqlConnection.query(sql, [values3], function(err, result, fields) {
                        if(err)
                            throw err;
                        console.log(result);
                        
                    });
                }    
            });
        }
        res.render('wtafrontpage.ejs');
});


app.post('/', urlencodedParser, function(req, res) {
    console.log(req.body);
    
    mysqlConnection.query("SELECT * FROM Users WHERE Email = ? AND password = ?",
                            [req.body.Email, req.body.pass], function(err, result, fields) {
        if (err) throw err;
                
        console.log(result);
                
        if(result.length > 0)
        {
            userid = result[0].User_id;
            res.render('wtafrontpage.ejs');
        }
        else
        {
            mysqlConnection.query("SELECT * FROM Users WHERE Email = ?",
                                    [req.body.Email], function(err, result) {

                console.log(result);

                if (result.length == 0) {
                    console.log('inside if');
                    msg.email = "Invalid email ID.";
                    res.render('login.ejs', {msg: msg});
                } else {
                    console.log(result.length);
                    console.log('inisde else')
                    msg.password = "Incorrect Password.";
                    res.render('login.ejs', {msg: msg});
                }

            });
        }

    });
        
});


app.post('/SignUp', urlencodedParser, function(req, res) {
    console.log(req.body);
    var user_details = {
        username : req.body.name,
        password : req.body.pass,
        Email : req.body.Email,
        Phone_number : req.body.phnumber
        
    };
    console.log(user_details);

    if(req.body.pass != req.body.cpass)
    {
        res.render('SignUp.ejs');
    }
    else
    {  
        mysqlConnection.query("INSERT INTO `new_Sem4_Project`.`Users` SET ?",
                                [user_details], function(err, result, fields) {
            if(err)
            {
                throw err;
            }
            else
            {
                console.log(result);
                mysqlConnection.query('Select User_id from new_Sem4_Project.Users where Phone_number = ?',
                    [user_details.Phone_number], function(err, result, fields){
                        if(err) throw err;
                        console.log(result[0].User_id);
                        userid = result[0].User_id;
                    })
                res.render('wtafrontpage.ejs');
            }
        }); 
             
    }

});


app.post('/book', urlencodedParser, function(req ,res){
    console.log(req.body.searchopt);
    mysqlConnection.query("Select * from new_Sem4_Project.Book where Book_name = ?",
        [req.body.searchopt],function(err, result, fields){
            if(err) throw err;
            if(result.length > 0){
                if(err) throw err;
                console.log(result);
                res.render('book',{id:result[0].book_id,name:result[0].Book_name,author:result[0].book_author,image:'NULL',desc:result[0].Description,price:result[0].Price,available:result[0].Availability,subjcode:result[0].subject_code});
                console.log(userid);
                bookid = result[0].book_id;
            }
            else{
                console.log('Book not found');
            }
        })
});


app.post('/addtocart/:data', urlencodedParser, function(req, res){
    console.log('in add to cart post');
    console.log(req.params.data);
    mysqlConnection.query("select * from new_Sem4_Project.Book where book_id = ?",
        [req.params.data],function(err, result, fields){
            console.log(result);
            if(result.length > 0){
                if(err) throw err;
                var values = {
                    bid : req.params.data,
                    uid : userid,
                    bookname : result[0].Book_name,
                    bookauthor : result[0].book_author,
                    price_of_book : result[0].Price,
                    no_of_books : '1'
                }
                console.log('values:');
                console.log(values);
                mysqlConnection.query('Select * from new_Sem4_Project.cart where bid = ? and uid = ?',
                    [values.bid, values.uid], function(err, result, fields){
                        if(err) throw err;
                        if(result.length == 0){
                            mysqlConnection.query("INSERT INTO `new_Sem4_Project`.`cart` SET ?",
                                [values], function(err, result, fields) {
                                    if(err) throw err;
                                    else{
                                        console.log('1 Row entered in the cart table');
                                    }
                                })
                            }
                        else if(result.length > 0){
                            mysqlConnection.query('Update cart set no_of_books = (no_of_books+1) where bid = ? and uid = ?',
                                [values.bid, values.uid], function(err, result, fields){
                                    if(err) throw err;
                                    else{
                                        console.log('1 row updated');
                                    }
                                })
                        }
                    })
                
            }
        });
    
    res.redirect( req.originalUrl.split("/")[0] + '/wtafrontpage' );

});

app.listen(3000);