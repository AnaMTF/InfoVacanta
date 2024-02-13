select 
	authornickname, 
	reviewcategory, 
	reviewbody, 
	rating, upvotes, 
	dateposted, 
	reviews.destinationid,
	destinations.destinationname
from reviews, destinations
where destinations.destinationid = reviews.destinationid;

select destinationname from destinations, reviews
where destinations.destinationid = reviews.destinationid

merge into  