{
  activeTab === "join-class" && (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mt: 6 }}>
        📚 Your Class Materials
      </Typography>

      {loadingVideos || !courses.length ? (
        <Typography sx={{ mt: 2 }}>Loading classes...</Typography>
      ) : (
        <>
          {/* 🔹 Combine videos and documents */}
          {videos.length === 0 && myDocuments.length === 0 ? (
            <Typography sx={{ mt: 2 }}>Class is not available now.</Typography>
          ) : (
            <>
              {/* Render videos */}
              {videos.map((video) => {
                const courseName =
                  courses.find((c) => c._id === video.courseId)?.name ||
                  "Unknown";
                const now = new Date();
                const unlockAt = new Date(video.unlockAt);

                return (
                  <Paper
                    key={video._id}
                    sx={{ p: 2, mt: 2, bgcolor: "#fff7f0" }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      🎥 {video.title}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Course:{" "}
                      <span style={{ color: "green" }}>{courseName}</span>
                    </Typography>

                    {now < unlockAt ? (
                      <Typography sx={{ mt: 1, color: "orange" }}>
                        Class will start on {unlockAt.toLocaleString()}
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="body2">
                          Uploaded:{" "}
                          {new Date(video.createdAt).toLocaleDateString()}
                        </Typography>

                        <video
                          style={{
                            marginTop: 15,
                            width: "100%",
                            borderRadius: 8,
                          }}
                          controls
                          src={video.fileUrl}
                        />

                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          href={video.fileUrl}
                          target="_blank"
                        >
                          Open Full Video
                        </Button>
                      </>
                    )}
                  </Paper>
                );
              })}

              {/* Render documents */}
              {myDocuments.map((doc) => {
                const courseName =
                  courses.find((c) => c._id === doc.courseId?._id)?.name ||
                  "Unknown";
                const now = new Date();
                const unlockAt = new Date(doc.unlockAt);

                return (
                  <Paper key={doc._id} sx={{ p: 2, mt: 2, bgcolor: "#f0f7ff" }}>
                    <Typography variant="h6" fontWeight="bold">
                      📄 {doc.title}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Course:{" "}
                      <span style={{ color: "green" }}>{courseName}</span>
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      href={doc.fileUrl}
                      target="_blank"
                    >
                      Open Document
                    </Button>
                  </Paper>
                );
              })}

              {/* Render upcoming documents */}
              {upcomingDocuments.map((doc) => {
                const courseName =
                  courses.find((c) => c._id === doc.courseId?._id)?.name ||
                  "Unknown";
                const unlockAt = new Date(doc.unlockAt);
                return (
                  <Paper key={doc._id} sx={{ p: 2, mt: 2, bgcolor: "#fff4e5" }}>
                    <Typography variant="h6" fontWeight="bold">
                      📄 {doc.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Course:{" "}
                      <span style={{ color: "green" }}>{courseName}</span>
                    </Typography>
                    <Typography sx={{ mt: 1, color: "orange" }}>
                      Will unlock on {unlockAt.toLocaleString()}
                    </Typography>
                  </Paper>
                );
              })}
              {loadingDocuments ? (
                <Typography sx={{ mt: 2 }}>Loading classes...</Typography>
              ) : documents.length === 0 ? (
                <Typography sx={{ mt: 2 }}>
                  Class is not available now.
                </Typography>
              ) : (
                documents.map((doc) => {
                  const courseName =
                    courses.find((c) => c._id === doc.courseId?._id)?.name ||
                    "Unknown";
                  const now = new Date();
                  const unlockAt = new Date(doc.unlockAt);
                  const isUnlocked = now >= unlockAt;

                  return (
                    <Paper
                      key={doc._id}
                      sx={{
                        p: 2,
                        mt: 2,
                        bgcolor: isUnlocked ? "#f0f7ff" : "#fff4e5",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        📄 {doc.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Course:{" "}
                        <span style={{ color: "green" }}>{courseName}</span>
                      </Typography>

                      {isUnlocked ? (
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          href={doc.fileUrl}
                          target="_blank"
                        >
                          Open Document
                        </Button>
                      ) : (
                        <Typography sx={{ mt: 1, color: "orange" }}>
                          Will unlock on {unlockAt.toLocaleString()}
                        </Typography>
                      )}
                    </Paper>
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </Paper>
  );
}

export const getStudentCourseMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;
    const now = Date.now(); // current timestamp in ms

    // Convert to ObjectId safely
    let studentObjectId;
    try {
      studentObjectId = new mongoose.Types.ObjectId(studentId);
    } catch {
      studentObjectId = null;
    }

    // Fetch cohorts where student exists
    const cohorts = await Cohort.find({
      $or: [
        { "studentIds.studentId": studentId },
        ...(studentObjectId
          ? [{ "studentIds.studentId": studentObjectId }]
          : []),
      ],
    });

    if (!cohorts || cohorts.length === 0) {
      return res
        .status(404)
        .json({ message: "You are not enrolled in any cohort yet." });
    }

    const unlockedMaterials = [];
    const lockedMaterials = [];

    for (const cohort of cohorts) {
      const studentData = cohort.studentIds.find(
        (s) =>
          s.studentId.toString() === studentId.toString() ||
          s.studentId === studentId
      );

      if (!studentData || !Array.isArray(studentData.enrollments)) continue;

      for (const enrollment of studentData.enrollments) {
        if (!enrollment.paymentConfirmed) continue;

        const courseInCohort = cohort.courses.find(
          (c) => c.courseId.toString() === enrollment.courseId.toString()
        );

        if (!courseInCohort) continue;

        const uploads = await Material.find({
          cohortId: cohort._id,
          course: courseInCohort.courseId,
        }).select("title type fileUrl coach unlockAt createdAt updatedAt");

        for (const upload of uploads) {
          const unlockTime = upload.unlockAt?.getTime() || 0;
          const expireTime = unlockTime + 3 * 60 * 60 * 1000; // 3 hours in ms

          if (unlockTime <= now && now <= expireTime) {
            // unlocked and within 3-hour window
            unlockedMaterials.push({
              cohortId: cohort._id,
              courseId: courseInCohort.courseId,
              ...upload.toObject(),
            });
          } else {
            // locked (either not yet unlocked OR expired)
            lockedMaterials.push({
              cohortId: cohort._id,
              courseId: courseInCohort.courseId,
              ...upload.toObject(),
            });
          }
        }
      }
    }

    if (unlockedMaterials.length === 0 && lockedMaterials.length === 0) {
      return res.status(404).json({
        message: "Your coach has not uploaded any course materials yet.",
      });
    }

    return res.status(200).json({
      message: "✅ Course materials fetched successfully",
      unlockedMaterials,
      lockedMaterialsMessage: lockedMaterials.length
        ? `Your coach has uploaded ${lockedMaterials.length} material(s). They will be available after the unlock time or are expired.`
        : null,
    });
  } catch (error) {
    console.error("❌ Fetch course materials failed:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getStudentDocuments = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Always use UTC for all comparisons
    const now = moment().utc().toDate();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1️⃣ Get cohorts the student belongs to
    const cohorts = await Cohort.find({ "studentIds.studentId": studentId })
      .select("studentIds courses")
      .populate({
        path: "studentIds.enrollments.courseId",
        select: "_id name",
      })
      .populate({
        path: "courses.courseId",
        select: "_id name coach",
        populate: { path: "coach", select: "_id fullName profilePhoto email" },
      });

    // 2️⃣ Build list of accessible course IDs
    const allowedCourseIds = [];

    cohorts.forEach((cohort) => {
      const student = cohort.studentIds.find(
        (s) => s.studentId.toString() === studentId
      );
      if (!student?.enrollments) return;

      student.enrollments.forEach((enrollment) => {
        if (enrollment.hasAccess)
          allowedCourseIds.push(enrollment.courseId._id.toString());
      });
    });

    if (!allowedCourseIds.length) {
      return res.status(200).json({
        message: "No accessible course materials",
        unlockedMaterials: [],
        upcomingMaterials: [],
        nextClass: null,
        nextClassCountdown: null,
        lockedMaterialsMessage: "No materials available",
        materialsByCourse: {},
        pagination: { page, limit, total: 0 },
      });
    }

    // 3️⃣ Fetch materials for allowed courses
    const allMaterials = await Material.find({
      course: { $in: allowedCourseIds },
    })
      .populate("course", "_id name coach")
      .sort({ unlockAt: 1 });

    const materialsByCourse = {};
    const unlockedMaterials = [];
    const upcomingMaterials = [];
    let nextClass = null;

    allMaterials.forEach((material) => {
      const unlockTime = moment(material.unlockAt).utc().toDate();
      const expireTime = new Date(unlockTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours

      const isUnlocked = now >= unlockTime && now <= expireTime;
      const isUpcoming = now < unlockTime;

      // Skip expired materials
      if (!isUnlocked && !isUpcoming) return;

      const courseId = material.course._id.toString();

      // Ensure group exists
      if (!materialsByCourse[courseId]) {
        materialsByCourse[courseId] = {
          courseId: material.course._id,
          courseName: material.course.name,
          coach: material.course.coach,
          unlocked: [],
          upcoming: [],
        };
      }

      const item = {
        _id: material._id,
        title: material.title,
        type: material.type,
        fileUrl: material.fileUrl,
        unlockAt: material.unlockAt,
        courseId: { _id: material.course._id, name: material.course.name },
        createdAt: material.createdAt,
      };

      if (isUnlocked) {
        materialsByCourse[courseId].unlocked.push(item);
        unlockedMaterials.push(item);
      } else if (isUpcoming) {
        materialsByCourse[courseId].upcoming.push(item);
        upcomingMaterials.push(item);

        if (!nextClass || moment(item.unlockAt).isBefore(nextClass.unlockAt)) {
          nextClass = item;
        }
      }
    });

    // 4️⃣ Build next class countdown
    let nextClassCountdown = null;
    if (nextClass) {
      const duration = moment.duration(
        moment(nextClass.unlockAt).diff(moment.utc())
      );
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      nextClassCountdown = `Next class unlocks in: ${hours}h ${minutes}m`;
    }

    // 5️⃣ Pagination by course groups
    const courseIds = Object.keys(materialsByCourse);
    const paginatedIds = courseIds.slice(skip, skip + limit);

    const paginatedData = {};
    paginatedIds.forEach((id) => {
      paginatedData[id] = materialsByCourse[id];
    });

    res.status(200).json({
      message: "✅ Materials fetched successfully",
      unlockedMaterials,
      upcomingMaterials,
      nextClass,
      nextClassCountdown,
      lockedMaterialsMessage:
        unlockedMaterials.length + upcomingMaterials.length === 0
          ? "No materials available"
          : null,
      materialsByCourse: paginatedData,
      pagination: {
        page,
        limit,
        total: courseIds.length,
      },
    });
  } catch (error) {
    console.error("❌ Could not fetch materials:", error);
    res.status(500).json({
      message: "Could not fetch materials",
      error: error.message,
    });
  }
};

{
  documents.map((doc) => {
    const unlockDateUTC = new Date(doc.unlockAt);
    const now = new Date();
    const isUnlocked = now >= unlockDateUTC;

    const unlockLocalString = unlockDateUTC.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const unlockUTCString =
      unlockDateUTC.toLocaleString("en-US", {
        timeZone: "UTC",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " UTC";

    return (
      <Paper
        key={doc._id}
        sx={{
          p: 2,
          mb: 2,
          borderLeft: isUnlocked ? "4px solid green" : "4px solid orange",
        }}
      >
        <Typography variant="h6">{doc.title}</Typography>
        <Typography variant="body2">Course: {doc.courseId?.name}</Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: isUnlocked ? "green" : "orange",
            fontWeight: 600,
          }}
        >
          {isUnlocked ? "Unlocked" : "Will unlock at"}
        </Typography>

        {/* Local time */}
        <Typography variant="body2">Local Time: {unlockLocalString}</Typography>

        {/* UTC time */}
        <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.7 }}>
          UTC Time: {unlockUTCString}
        </Typography>

        {/* Download Button */}
        <Box sx={{ mt: 2 }}>
          {isUnlocked ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.open(doc.fileUrl, "_blank")}
            >
              Download
            </Button>
          ) : (
            <Button variant="outlined" disabled>
              Locked
            </Button>
          )}
        </Box>
      </Paper>
    );
  });
}
