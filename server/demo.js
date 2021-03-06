const {MongoClient} = require('mongodb');
require('dotenv').config()


async function  main() {
    const uri = process.env.MONGO_URL;
    const client = new MongoClient(uri);
    try {
        await client.connect();
       /*  await ListDatabases(client); */
        /* await createListing(client, {
            name: "Lovely Loft",
            summary: "A charming loft in Paris",
            bedrooms: 1,
            bathrooms: 1
        }) */
        /* await createMultipleListings(client, [
            {
                name: "Loft London",
                summary: "A beautiful Loft in London",
                bedrooms: 1,
                bathrooms: 1
            },
            {
                name: "House Dublin",
                summary: "Big house in Dublin",
                bedrooms: 5,
                bathrooms: 3
            }
        ]); */
        /* await findOneListingByName(client, "Loft London"); */
        await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
            minimumNumberOfBedrooms: 1,
            minimumNumberOfBathrooms: 1,
            maximumNumberOfResults: 5
        });
        /* await updateListingByName(client, "Loft London", {bedrooms: 3, bathrooms: 1}); */
        /* await upsertListingByName(client, "Cozy Cottage", {name: "Cozy Cottage", bedrooms: 2, bathrooms: 1}); */
        /* await updateAllListingsToHavePropertyType(client); */
        /* await deleteListingByName(client, "House Dublin"); */
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});

    console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({property_type: {$exists: false}}, {$set: {property_type: "Unknown"}});
    
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name: nameOfListing}, {$set: updatedListing}, {upsert: true});
    console.log(`${result.matchedCount} document(s) matched the query criteria`);

    if(result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId}`);
    }else{
        console.log(`${result.modifiedCount} document(s) was/were updated`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name: nameOfListing}, {$set: updatedListing});
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} documents was/were updated`);
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: {$gte: minimumNumberOfBedrooms},
        bathrooms: {$gte: minimumNumberOfBathrooms},
    }).sort({last_review: -1}).limit(maximumNumberOfResults);

    const results = await cursor.toArray();

    if (results.length > 0 ){
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms :`);
        results.forEach((result, i) => {
            console.log();
            console.log(`${i+1}. name: ${result.name}`);
            console.log(`_id: ${result.bedrooms}`);
            console.log(`bedrooms: ${result.bedrooms}`);
            console.log(`bathrooms: ${result.bathrooms}`);
        })
    }else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameOfListing});

    if(result) {
        console.log(`Found a listing in the collection with the name ${nameOfListing}`);
        console.log(result);
    } else {
        console.log(`No listings found with the name ${nameOfListing}`);
    }
}

async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);

    console.log(`${result.insertedCount} new listings created with the following id(s) :`)
    console.log(result.insertedIds);
}

async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);
}

async function ListDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases :");
    databasesList.databases.forEach(db => {
        console.log(`- ${db.name}`);
    });
}

main().catch(console.error());