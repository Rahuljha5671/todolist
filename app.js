//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { inflateRaw } = require("zlib");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('viewusers.ejs');
});

module.exports = router;

const app = express();

app.set('view engine', 'ejs');
app.set('views',__dirname+"/views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-rahul:maggi777@cluster0.tek4e.mongodb.net/?retryWrites=true",{
  dbName:"todolistDB"
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list"
})
const item2 = new Item({
  name: "Welcome"
})
const item3 = new Item({
  name: "Welcome to your hj"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const day = date.getDate();
app.get("/", function (req, res) {



  Item.find({}, function (err, foundItems) {


    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("successfully saved default items to DB");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newEntry = new Item({
    name: itemName
  });

  if (req.body.list != day) {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newEntry);
      foundList.save();
      res.redirect("/" + listName);

    });

  }
  else {
    newEntry.save();

    // items.push(item);
    res.redirect("/");
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else {
    //first-condition---->which list
    //secondly----->kya krna hai ie pull and kis array me lis chij ke saath(id mentioned)
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }




});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);

      }
      else {
        // show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })


});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(5500, function () {
  console.log("Server started on port 3000");
});
