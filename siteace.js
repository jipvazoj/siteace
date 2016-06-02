Websites = new Mongo.Collection("websites");
Comments = new Mongo.Collection("comments");

WebsitesIndex = new EasySearch.Index({
  collection: Websites,
  fields: ['url', 'title','description'],
  engine: new EasySearch.Minimongo(
  {
        sort: function(){
            return {upVotes: -1};
        }
    }
  ),
});

// EasySearch.createSearchIndex('WebsitesIndex', {
  // 'collection': Websites, // instanceof Meteor.Collection
  // 'field': ['url', 'title','description','upVotes'], // array of fields to be searchable
  // 'use' : 'mongo-db',
  // 'sort': function() {return { 'upVotes': -1}}
  // });

Websites.allow({
	insert:function(user_Id,doc){
		if(Meteor.user()){
			return true
		}
		else{
			return false
		}
	},
	update:function(){return true}
});

Router.configure({
    layoutTemplate:'ApplicationLayout'
});

Router.route('/', function() {
    this.render('home', {
        to: "main"
    });
});

Router.route('/:_id', function() {
    this.render('site_detail', {
        to: "main",
        data: function() {
            return Websites.findOne({_id: this.params._id});
        }
    });
});

if (Meteor.isClient) {

	/////
	// template helpers 
	/////
    Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
	// helper function that returns all available websites ordenados por votos a favor

	/////
	// template events 
	/////
	Template.comment_list.helpers({
		comments: function() {
			return Comments.find({site: this._id}, {sort: {createdOn: 1}});
		}
	});
	
	Template.website_list.helpers({
		comments: function() {
			return Websites.find({site: this._id}, {sort: {upVotes: -1}});
		}
	});
	
	Template.site_detail.events({
    "submit .js-add-comment-form": function(event) {
        var comment = event.target.comment.value;
        var site = this._id;
        Comments.insert({
            comment: comment,
            site: site,
			owner: Meteor.user()._id,
            createdOn: new Date()
        });
        $(".js-add-comment-form input").val('');
        return false;
    }
	});
	
	Template.search.helpers({
	WebsitesIndex: () => WebsitesIndex,

	});

	Template.comment_item.helpers({
		getUser:function(user_id){
		  var user = Meteor.users.findOne({_id:user_id});
		  if (user){
		    return user.username;
		  }
		  else {
		    return "anonymous";
		  }
		}
	});

	Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);
			// put the code in here to add a vote to a website!
			Websites.update({_id:website_id}, {$set:{upVotes:this.upVotes+1}});
			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);
			Websites.update({_id:website_id}, {$set:{downVotes:this.downVotes+1}});

			return false;// prevent the button from reloading the page
		}
	})

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
		}, 
		"submit .js-save-website-form":function(event){

			// here is an example of how to get the url out of the form:
			var url = event.target.url.value;
			console.log("The url they entered is: "+url);
			
			//  put your website saving code in here!	
			var title = event.target.title.value;
			var description = event.target.description.value;
			Websites.insert({
				url:url,
				title:title,
				description:description,
				createdOn:new Date(),
				upVotes: 0,
                downVotes: 0});
			return false;// stop the form submit from reloading the page

		}
	});
	
	Template.comment_form.events({
		"submit .js-save-comment-form":function(event){
            // here is an example of how to get the comment out of the form:
            var comment = event.target.comment.value;
            console.log("The comment they entered is: "+comment);
            Comments.insert({
                website: Router.current().params._id, 
                comment: comment,
				owner: Meteor.user()._id,
                createdOn: new Date(),
            });
		return false; // stop the form submit from reloading the page
		}
 
	});
}
if (Meteor.isServer) {
	// start up function that creates entries in the Websites databases.
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	  Websites.insert({
    		title:"Goldsmiths Computing Department", 
    		url:"http://www.gold.ac.uk/computing/", 
    		description:"This is where this course was developed.", 
    		createdOn:new Date(),
			upVotes: 0,
            downVotes: 0
    	});
    	 Websites.insert({
    		title:"University of London", 
    		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
    		description:"University of London International Programme.", 
    		createdOn:new Date(),
			upVotes: 0,
            downVotes: 0
    	});
    	 Websites.insert({
    		title:"Coursera", 
    		url:"http://www.coursera.org", 
    		description:"Universal access to the world’s best education.", 
    		createdOn:new Date(),
			upVotes: 0,
            downVotes: 0
    	});
    	Websites.insert({
    		title:"Google", 
    		url:"http://www.google.com", 
    		description:"Popular search engine.", 
    		createdOn:new Date(),
			upVotes: 0,
            downVotes: 0
    	});
    }
  });
  

}