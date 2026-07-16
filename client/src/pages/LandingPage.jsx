import Navbar from "../components/common/Navbar";

const LandingPage = () => {
  return (
    <>
      <Navbar />

      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <h1>AI-powered Farmer Disaster Reporting</h1>

        <p>
          Faster Damage Assessment • Faster Government Response
        </p>

        <button>Farmer Login</button>

        <button style={{ marginLeft: "20px" }}>
          Government Login
        </button>
      </div>
    </>
  );
};

export default LandingPage;