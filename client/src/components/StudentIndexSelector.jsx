import React, { useState, useEffect } from "react";
import { HiOutlineIdentification, HiChevronDown, HiOutlineX } from "react-icons/hi";
import API from "../api";

const CONNECTION_ERROR_MESSAGE = "Could not connect to the database. Please check if the server is live.";

const StudentIndexSelector = ({ onSelect, onError, hideInlineError = false }) => {
  const [studentIndex, setStudentIndex] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchStudents = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await API.get("/students", { signal: controller.signal });
        const data = response.data;
        const mappedStudents = Array.isArray(data)
          ? data.map((student) => ({
              _id: student._id,
              indexno: student.indexno || "",
              firstname: student.firstname || "",
              lastname: student.lastname || "",
              grade: student.grade || "",
              name: [student.firstname, student.lastname].filter(Boolean).join(" ").trim(),
            }))
          : [];

        setStudentOptions(mappedStudents);
        setFilteredOptions(mappedStudents);
      } catch (error) {
        if (error.name === "AbortError") return;
        const errorMessage = CONNECTION_ERROR_MESSAGE;
        setLoadError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();

    return () => controller.abort();
  }, []);

  const handleInputChange = (value) => {
    setStudentIndex(value);

    const query = value.toLowerCase().trim();

    if (!query) {
      setFilteredOptions(studentOptions);
      setIsDropdownOpen(true);
      return;
    }

    const filtered = studentOptions.filter((student) => {
      const searchableText = [student.indexno, student.firstname, student.lastname, student.name, student.grade]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });

    setFilteredOptions(filtered);
    setIsDropdownOpen(true);
  };

  const handleSelectStudent = (student) => {
    setStudentIndex(student.indexno || "");
    setIsDropdownOpen(false);
    setFilteredOptions(studentOptions);

    if (onSelect) {
      onSelect(student);
    }
  };

  const handleClear = () => {
    setStudentIndex("");
    setFilteredOptions(studentOptions);
    setIsDropdownOpen(false);

    if (onSelect) {
      onSelect(null);
    }
  };

  return (
    <div className="w-full max-w-none">
      <div className="flex flex-col gap-1.5">
        <label
          className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${
            studentIndex ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          Search Student
        </label>

        <div className="relative">
          <div className="relative group flex items-center gap-3">
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${
                studentIndex ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"
              }`}
            >
              <HiOutlineIdentification className="text-xl" />
            </div>

            <input
              type="text"
              value={studentIndex}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Type index number, name, or grade..."
              className={`w-full pl-12 pr-16 py-3 sm:py-3.5 rounded-2xl border outline-none transition-all duration-300 ${
                studentIndex
                  ? "bg-indigo-50 border-indigo-400 text-slate-800 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              }`}
            />

            {studentIndex && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all z-20"
                tabIndex={-1}
              >
                <HiOutlineX className="text-lg" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all z-20 ${
                isDropdownOpen ? "text-indigo-500 rotate-180" : "text-slate-400"
              }`}
              tabIndex={-1}
            >
              <HiChevronDown className="text-lg" />
            </button>
          </div>

          {loadError && !hideInlineError && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-rose-50 border border-rose-200 rounded-2xl shadow-lg z-50 p-3 sm:p-4 text-center text-rose-700 text-sm">
              {loadError}
            </div>
          )}

          {isDropdownOpen && !loadError && isLoading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 p-3 sm:p-4 text-center text-slate-500 text-sm">
              Loading students...
            </div>
          )}

          {isDropdownOpen && !loadError && !isLoading && filteredOptions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 max-h-52 overflow-y-auto">
              {filteredOptions.map((student) => (
                <button
                  type="button"
                  key={student._id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-slate-800 text-sm sm:text-base">{student.indexno}</div>
                    <div className="text-xs text-slate-500">{student.name || "Unnamed student"}</div>
                    <div className="text-xs font-semibold text-indigo-600">{student.grade}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isDropdownOpen && !loadError && !isLoading && studentIndex && filteredOptions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 p-4 text-center text-slate-500">
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentIndexSelector;
