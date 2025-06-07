// Load projects from projects.json
var projects = {};
$.getJSON("projects.json", function(data) {
    projects = data;
});

console.log(projects);

// Get URL parameters
url = new URL(window.location.href);

tags = url.searchParams.get("tags");
if (tags) {
    tags = tags.split(",");
}
page = url.searchParams.get("page");

console.log(tags);
console.log(page);