{
  activeTab === "upload-video" && (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mt: 4 }}>
        🎥 Upload Video
      </Typography>

      {/* Upload Instructions */}
      <Typography sx={{ mb: 2, color: "text.secondary" }}>
        ⚠️ Upload Guidelines:
        <br />• Videos must not exceed <b>20MB</b>
        <br />• Documents must not exceed <b>8MB</b>
      </Typography>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!videoTitle) return alert("Video title is required!");
          if (!videoFile) return alert("Please select a video file!");
          if (!classStartTime) return alert("Class start time is required!");
          if (!selectedCourseId) return alert("Please select a course!");
          if (!selectedCohortId) return alert("Please select a cohort!");

          const utcTime = new Date(classStartTime).toISOString();

          const formData = new FormData();
          formData.append("title", videoTitle);
          formData.append("file", videoFile);
          formData.append("classStartTime", utcTime);
          formData.append("courseId", selectedCourseId);
          formData.append("cohortId", selectedCohortId);

          try {
            setLoading(true);
            const { data } = await axios.post(
              `${BASE_URL}/api/coach/upload-video`,
              formData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(data.message);
            setVideoTitle("");
            setVideoFile(null);
            setClassStartTime("");
            setSelectedCourseId(courses[0]?._id || "");
            setSelectedCohortId(cohorts[0]?.cohortId || "");
            loadVideos();
            await fetchMyVideos();
          } catch (err) {
            console.error(err);
            const errMsg =
              err.response?.data?.message || err.message || "Upload failed";
            setMessage(`❌ ${errMsg}`);
          } finally {
            setLoading(false);
          }
        }}
      >
        <TextField
          label="Video Title"
          fullWidth
          required
          sx={{ mb: 2 }}
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
        />
        <TextField
          label="Class Start Time"
          type="datetime-local"
          fullWidth
          required
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          value={classStartTime}
          onChange={(e) => setClassStartTime(e.target.value)}
        />
        <TextField
          label="Select Course"
          select
          fullWidth
          required
          sx={{ mb: 2 }}
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          {courses.length === 0 ? (
            <MenuItem disabled>No courses available</MenuItem>
          ) : (
            courses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          label="Select Cohort"
          select
          fullWidth
          required
          sx={{ mb: 2 }}
          value={selectedCohortId}
          onChange={(e) => setSelectedCohortId(e.target.value)}
        >
          {cohorts.length === 0 ? (
            <MenuItem disabled>No cohorts available</MenuItem>
          ) : (
            cohorts.map((cohort) => (
              <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                {cohort.cohortName}
              </MenuItem>
            ))
          )}
        </TextField>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Button variant="contained" component="label">
            Choose Video
            <input
              hidden
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const maxVideoSize = 20 * 1024 * 1024; // 20MB
                if (file.size > maxVideoSize) {
                  alert("❌ Video must not be more than 20MB");
                  e.target.value = "";
                  return;
                }

                setVideoFile(file);
              }}
            />
          </Button>

          {videoFile && (
            <Typography sx={{ mt: 1 }}>Selected: {videoFile.name}</Typography>
          )}

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Upload Video"}
          </Button>
        </Box>
      </form>

      {message && (
        <Typography color={message.includes("failed") ? "error" : "green"}>
          {message}
        </Typography>
      )}

      <Typography variant="h6">🎬 My Uploaded Videos</Typography>

      {Array.isArray(myVideos) && myVideos.length > 0 ? (
        myVideos.map((video) => (
          <LazyVideoWrapper key={video._id}>
            <VideoChatCard
              video={video}
              chatMessages={chatMessages}
              newMessages={newMessages}
              setNewMessages={setNewMessages}
              sendStudentMessage={sendStudentMessage}
              handleDeleteVideo={handleDeleteVideo}
              studentId={studentId}
            />
          </LazyVideoWrapper>
        ))
      ) : (
        <Typography sx={{ mt: 2 }}>No videos uploaded yet.</Typography>
      )}
    </Paper>
  );
}

const LazyVideoWrapper = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px",
  });

  return (
    <div ref={ref} style={{ minHeight: 120 }}>
      {inView ? children : <Typography>Loading video...</Typography>}
    </div>
  );
};

import { useInView } from "react-intersection-observer";
