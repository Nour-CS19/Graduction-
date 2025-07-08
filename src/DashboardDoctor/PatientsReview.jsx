import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// Example data
const initialReviews = [
  {
    id: 1,
    name: 'Thomas Israel',
    title: 'Orthopedic Patient',
    avatar: 'https://i.pravatar.cc/100?img=1', // Example avatar
    rating: 5,
    review: 'Excellent experience! Highly recommend the service.'
  },
  {
    id: 2,
    name: 'Carl Oliver',
    title: 'Manager',
    avatar: 'https://i.pravatar.cc/100?img=2',
    rating: 4.5,
    review: 'Doctor was very kind and the staff was helpful.'
  },
  {
    id: 3,
    name: 'Barbara McIntosh',
    title: 'Developer',
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 5,
    review: 'Felt very comfortable, and the process was quick and painless.'
  },
  {
    id: 4,
    name: 'Christa Smith',
    title: 'Patient',
    avatar: 'https://i.pravatar.cc/100?img=4',
    rating: 5,
    review: 'The clinic is spotless, and the staff are friendly.'
  },
  {
    id: 5,
    name: 'Dean Tolle',
    title: 'Developer',
    avatar: 'https://i.pravatar.cc/100?img=5',
    rating: 4,
    review: 'Scheduling was easy, but I had a slight wait time.'
  },
  {
    id: 6,
    name: 'Wendy Felix',
    title: 'Designer',
    avatar: 'https://i.pravatar.cc/100?img=6',
    rating: 5,
    review: 'Absolutely perfect service. Highly satisfied!'
  },
];

const PatientReview = () => {
  const [reviews, setReviews] = useState(initialReviews);

  // New Review form states
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  // Compute average rating
  const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

  // Hard-coded rating distribution (for demonstration).
  // In a real app, you’d compute how many 5-star, 4-star, etc. from `reviews`.
  const ratingDistribution = [
    { label: 'Very Satisfied', star: 5, percentage: 70 },  // e.g. 70%
    { label: 'Satisfied', star: 4, percentage: 15 },
    { label: 'Neutral', star: 3, percentage: 10 },
    { label: 'Dissatisfied', star: 2, percentage: 3 },
    { label: 'Very Dissatisfied', star: 1, percentage: 2 },
  ];

  // Star rendering helper
  const renderStars = (ratingValue) => {
    // Round ratingValue to the nearest half
    const rounded = Math.round(ratingValue * 2) / 2;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(<FaStar key={i} className="text-yellow-500 inline-block" />);
      } else if (i - 0.5 === rounded) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500 inline-block" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500 inline-block" />);
      }
    }
    return stars;
  };

  // Handle new review submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newReviewText) return;

    const newReview = {
      id: reviews.length + 1,
      name: newName,
      title: newTitle || 'Patient',
      avatar: 'https://i.pravatar.cc/100?u=' + (reviews.length + 1), // Example unique avatar
      rating: parseFloat(newRating),
      review: newReviewText
    };
    setReviews([...reviews, newReview]);
    setNewName('');
    setNewTitle('');
    setNewReviewText('');
    setNewRating(5);
  };

  return (
    <div className="container my-5">
      <div className="row">
        {/* Left Column: Average Rating & Distribution */}
        <div className="col-lg-4 mb-5">
          <div className="p-4 border rounded shadow-sm h-100">
            {/* Average Rating */}
            <div className="mb-4 text-center">
              <h1 className="text-4xl font-bold mb-1">{averageRating.toFixed(1)}</h1>
              <div>{renderStars(averageRating)}</div>
              <p className="text-gray-500 mt-1">Avg. Ratings</p>
            </div>

            {/* Rating Distribution */}
            <div>
              {ratingDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    {item.label} <span className="ml-1 text-gray-500">{item.star} Star</span>
                  </div>
                  <div className="w-1/2 ml-3">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reviews List & New Review Form */}
        <div className="col-lg-8">
          {/* Reviews List */}
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded shadow-sm">
                <div className="flex items-center mb-3">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h5 className="font-bold text-base mb-0">{r.name}</h5>
                    <p className="text-sm text-gray-500">{r.title}</p>
                  </div>
                </div>
                <div className="mb-2">{renderStars(r.rating)}</div>
                <p className="text-gray-700 text-sm">{r.review}</p>
              </div>
            ))}
          </div>

          {/* New Review Form */}
          <div className="bg-light p-4 mt-5 rounded shadow-sm">
            <h4 className="mb-3">Add a New Review</h4>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label font-semibold">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="title" className="form-label font-semibold">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Manager, Patient, etc."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="review" className="form-label font-semibold">
                  Review
                </label>
                <textarea
                  id="review"
                  className="form-control"
                  rows="3"
                  placeholder="Write your review here..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="rating" className="form-label font-semibold">
                  Rating
                </label>
                <select
                  id="rating"
                  className="form-select"
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4.5">4.5 - Very Good</option>
                  <option value="4">4 - Good</option>
                  <option value="3.5">3.5 - Fair</option>
                  <option value="3">3 - Neutral</option>
                  <option value="2.5">2.5 - Not Great</option>
                  <option value="2">2 - Poor</option>
                  <option value="1.5">1.5 - Very Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReview;
