const publications = Object.freeze([
  {
    id: "10000000-0000-4000-8000-000000000001",
    title: "Playgroup Patterns",
    category: "early-learning",
    class: ["Playgroup"],
    subject: "Creative Learning",
    medium: "English",
    series: "First Steps",
    type: "Activity",
    mrp: 120,
    active: true
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    title: "Nursery Numbers",
    category: "early-learning",
    class: ["Nursery", "NUR"],
    subject: "Mathematics",
    medium: "English",
    series: "First Steps",
    type: "Activity",
    mrp: 130,
    active: true
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    title: "LKG Kannada",
    category: "early-learning",
    class: ["LKG"],
    subject: "Kannada",
    medium: "Kannada",
    series: "Language Start",
    type: "Writing",
    mrp: 140,
    active: true
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    title: "UKG Rhymes",
    category: "early-learning",
    class: ["UKG"],
    subject: "English",
    medium: "English",
    series: "Language Start",
    type: "Rhymes",
    mrp: 150,
    active: false
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    title: "Class Five Science",
    category: "school",
    class: ["5"],
    subject: "Science",
    medium: "English",
    series: "School Learning",
    type: "Textbook",
    sku: "SYN-5-SCI",
    isbn: "9780000000005",
    mrp: 230,
    active: true
  }
]);

function clonePublications() {
  return JSON.parse(JSON.stringify(publications));
}

module.exports = { publications, clonePublications };
