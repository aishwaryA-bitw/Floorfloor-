import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

const FlatDetails = ({ building, floor, flat, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [flatTaskData, setFlatTaskData] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState("All");
  const [submitLoadingCategory, setSubmitLoadingCategory] = useState(null);
  const [submittedCategories, setSubmittedCategories] = useState([]);
  const [taskLoading, setTaskLoading] = useState(null);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzlbHC7RwSjI7pF-OYWm5XuuRXt0LWtRbYjR-sccT59UwcqQMKOKfN8d2pMyRjDFmVS/exec";

  useEffect(() => {
    async function fetchFlatTasks() {
      try {
        setLoading(true);

        const serialNo = encodeURIComponent(building["Serial No."]);
        const cbNo = encodeURIComponent(flat["CB-No"]);
        const bfNo = encodeURIComponent(flat["BF No"]);
        const buildingName = encodeURIComponent(building["Budling Name"]);
        const floorName = encodeURIComponent(floor["Floor Name"]);

        const { data } = await axios.get(
          `${SCRIPT_URL}?action=fetchFlatTasks&serialNo=${serialNo}&cbNo=${cbNo}&bfNo=${bfNo}&buildingName=${buildingName}&floorName=${floorName}`
        );

        if (data.success) {
          const grouped = {};
          data.data.forEach((task) => {
            const category = task["Task category"] || "Uncategorized";
            const taskNo = task["Task No"];
            if (!grouped[category]) {
              grouped[category] = {
                id: Object.keys(grouped).length + 1,
                category,
                categoryColor: getCategoryColor(category),
                tasks: [],
                vendorName: task["Vendor Name"] || "",
                payment: task["Payment Status"] || "",
                billing: task["Bill"] || "",
              };
            }
            grouped[category].tasks.push({
              id: task["Task ID"],
              name: task["Action"],
              completed: Boolean(task["Actual date"]),
              assignedTo: task["Vendor Name"] || "Unassigned",
              taskNo,
            });
          });

          setFlatTaskData(Object.values(grouped));
        } else {
          console.error("Error fetching tasks:", data.message);
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlatTasks();
  }, [building, floor, flat]);

  const getCategoryColor = (category) => {
    const map = {
      Electrical: "bg-blue-100 text-blue-800 border-blue-200",
      Plumbing: "bg-blue-100 text-blue-800 border-blue-200",
      Painting: "bg-blue-100 text-blue-800 border-blue-200",
      Flooring: "bg-blue-100 text-blue-800 border-blue-200",
      Uncategorized: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return map[category] || "bg-blue-100 text-blue-800 border-blue-200";
  };

  // const toggleTask = async (categoryId, taskId, taskNo) => {
  //   try {
  //     setTaskLoading(taskId);
  //     await axios.post(SCRIPT_URL, null, {
  //       params: {
  //         action: "updateActualDate",
  //         taskNo,
  //         buildingName: building["Budling Name"],
  //       },
  //     });

  //     setFlatTaskData((prevData) =>
  //       prevData.map((category) =>
  //         category.id === categoryId
  //           ? {
  //               ...category,
  //               tasks: category.tasks.map((task) =>
  //                 task.id === taskId ? { ...task, completed: true } : task
  //               ),
  //             }
  //           : category
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Failed to update date:", error);
  //   } finally {
  //     setTaskLoading(null);
  //   }
  // };


  const toggleTask = async (categoryId, taskId, taskNo) => {
  // Instantly update UI before API call
  setFlatTaskData((prevData) =>
    prevData.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            tasks: category.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: true } : task
            ),
          }
        : category
    )
  );

  try {
    await axios.post(SCRIPT_URL, null, {
      params: {
        action: "updateActualDate",
        taskNo,
        buildingName: building["Budling Name"],
      },
    });
    // Optionally: You can show toast or success feedback here
  } catch (error) {
    console.error("Failed to update actual date:", error);

    // Rollback the UI if API fails (optional, or just show error)
    setFlatTaskData((prevData) =>
      prevData.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              tasks: category.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: false } : task
              ),
            }
          : category
      )
    );
  }
};


  const handleSubmit = async (category) => {
    if (!category.vendorName || !category.payment || !category.billing) return;
    setSubmitLoadingCategory(category.id);
    try {
      await axios.post(SCRIPT_URL, null, {
        params: {
          action: "updateCategoryMeta",
          buildingName: building["Budling Name"],
          category: category.category,
          vendorName: category.vendorName,
          payment: category.payment,
          billing: category.billing,
        },
      });
      setSubmittedCategories((prev) => [...prev, category.id]);
    } catch (err) {
      console.error("Submit failed", err);
    } finally {
      setSubmitLoadingCategory(null);
    }
  };

  const categoriesToDisplay =
    filteredCategory === "All"
      ? flatTaskData
      : flatTaskData.filter((cat) => cat.category === filteredCategory);

  return (
    // <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
    <div className="p-2 md:p-3 space-y-2 md:space-y-3 bg-blue-50 min-h-screen">
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-4 md:p-6 text-white sm:p-6 border border-gray-200"> */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-2 md:p-3 text-white sm:p-6 border border-gray-200">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                {building["Budling Name"]} - {floor["Floor Name"]} - {flat["Each Floor Flat No"]}
              </h1>
              <p className="text-sm sm:text-base text-blue-100">
                Task management for {flat.type} flat
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto relative">
          <select
            value={filteredCategory}
            onChange={(e) => setFilteredCategory(e.target.value)}
            className="appearance-none w-full border border-blue-200 bg-white rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            {flatTaskData.map((cat) => (
              <option key={cat.id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {categoriesToDisplay.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No tasks found for this category</p>
            </div>
          ) : (
            categoriesToDisplay.map((category) => {
              const categoryCompletedTasks = category.tasks.filter(
                (task) => task.completed
              ).length;
              const categoryProgress = Math.round(
                (categoryCompletedTasks / category.tasks.length) * 100
              );

              const isSubmitted = submittedCategories.includes(category.id);

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 sm:p-6 border-b border-gray-200 bg-blue-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full border ${category.categoryColor}`}
                        >
                          {category.category}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {categoryCompletedTasks}/{category.tasks.length} tasks completed
                        </span>
                      </div>

                      <div className="flex-1 max-w-md">
                        <div className="flex flex-col sm:flex-row gap-2 flex-wrap items-center">
                          <input
                            placeholder="Vendor Name"
                            value={category.vendorName || ""}
                            disabled={isSubmitted}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFlatTaskData((prev) =>
                                prev.map((cat) =>
                                  cat.id === category.id ? { ...cat, vendorName: value } : cat
                                )
                              );
                            }}
                            className={`border border-blue-200 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isSubmitted ? "bg-gray-100" : "bg-white"
                            }`}
                          />
                          <select
                            value={category.payment || ""}
                            disabled={isSubmitted}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFlatTaskData((prev) =>
                                prev.map((cat) =>
                                  cat.id === category.id ? { ...cat, payment: value } : cat
                                )
                              );
                            }}
                            className={`border border-blue-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isSubmitted ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            <option value="">Payment Status</option>
                            <option value="Yes">Paid</option>
                            <option value="No">Pending</option>
                          </select>
                          <select
                            value={category.billing || ""}
                            disabled={isSubmitted}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFlatTaskData((prev) =>
                                prev.map((cat) =>
                                  cat.id === category.id ? { ...cat, billing: value } : cat
                                )
                              );
                            }}
                            className={`border border-blue-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isSubmitted ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            <option value="">Billing Status</option>
                            <option value="Yes">Billed</option>
                            <option value="No">Pending</option>
                          </select>
                          <button
                            disabled={
                              !category.vendorName ||
                              !category.payment ||
                              !category.billing ||
                              submitLoadingCategory === category.id ||
                              isSubmitted
                            }
                            onClick={() => handleSubmit(category)}
                            className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 w-full sm:w-auto ${
                              submitLoadingCategory === category.id || isSubmitted
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {submitLoadingCategory === category.id
                              ? "Submitting..."
                              : isSubmitted
                              ? "✓ Submitted"
                              : "Submit Details"}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${categoryProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {categoryProgress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                      {category.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-4 min-w-0 flex-1">
                            <button
                              onClick={() => toggleTask(category.id, task.id, task.taskNo)}
                              className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                                task.completed
                                  ? "bg-green-100 text-green-600"
                                  : "border border-gray-300 hover:border-blue-400"
                              }`}
                              disabled={task.completed || taskLoading === task.id}
                            >
                              {task.completed ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : taskLoading === task.id ? (
                                <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : null}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`font-medium text-sm sm:text-base ${
                                  task.completed
                                    ? "line-through text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {task.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                Assigned to: {task.assignedTo}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {task.completed ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">Done</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Pending</span>
                                <span className="sm:hidden">Todo</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default FlatDetails;