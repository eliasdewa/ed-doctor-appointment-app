import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import DoctorCard from "../components/DoctorCard";

const categories = [
  "All",
  "General Physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];
const Doctors = () => {
  const navigate = useNavigate();
  // get all doctors
  const { doctors } = useContext(AppContext);

  // Filter doctors based on the selected specialty & search query
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesCategory =
      selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  // Toggle filter visibility
  const [showFilter, setShowFilter] = useState(false);

  // pagination
  const ITEMS_PER_PAGE = 6; // Number of doctors to display per page
  const [currentPage, setCurrentPage] = useState(1);
  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  // Get the doctors for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);
  // console.log(currentDoctors)

  return (
    <div className="max-w-screen-2xl mx-auto px-8">
      <div className="flex flex-col sm:flex-row gap-5 mt-5">
        {/* Left side */}
        <div>
          {/* Filter btn */}
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className={`py-1 px-3 border rounded text-sm transition-all sm:hidden mt-6 ${
              showFilter ? "bg-primary text-white" : ""
            }`}
          >
            Filter
          </button>
          {/* Specialty Filters */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${
              showFilter ? "flex" : "hidden sm:flex"
            } flex-col justify-center space-y-4 my-6`}
          >
            {categories.map((specialty) => (
              <button
                key={specialty}
                onClick={() => {
                  setSelectedSpecialty(specialty);
                  setCurrentPage(1); // Reset to the first page when changing categories
                  setShowFilter((prev) => !prev);
                }}
                className={`px-4 py-2 rounded ${
                  selectedSpecialty === specialty
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {specialty}
              </button>
            ))}
          </motion.div>
        </div>
        {/* Right side */}
        <div className="flex-1 flex-col gap-2">
          {/* Search Input */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full flex gap-2 sm:mt-6 mb-4"
          >
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to the first page when searching
              }}
              className="w-full max-w-6xl p-2 border rounded"
            />
            <button className="hidden md:block w-full md:w-auto py-2 px-8 bg-primary text-white rounded">
              <Search />
            </button>
          </motion.div>

          {/* Display doctors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full grid grid-cols-auto gap-4 gap-x-6"
          >
            {currentDoctors.map((doctor, index) => (
              <DoctorCard doctor={doctor} />
            ))}
          </motion.div>
          {/* Pagination controller */}
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 ${
                  currentPage === index + 1 ? "bg-blue-700" : "bg-blue-500"
                } text-white rounded`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Doctors;
