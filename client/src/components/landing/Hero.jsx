import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import hero from "../../assets/images/hero.png";

const Hero = () => {
    const navigate = useNavigate();
  return (
    <section className="bg-[#F8FAFC]">

      <div className="max-w-7xl mx-auto px-5 py-14">

        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">

          {/* Left */}

          <div className="flex-1 text-center lg:text-left">

            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              AI Powered Agriculture Platform
            </span>

            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">

              AI-powered Farmer Disaster Reporting
              <span className="text-green-700">
                {" "} & Decision Support
              </span>

            </h1>

            <p className="mt-6 text-slate-600 text-lg leading-8">

              Upload crop images from the field.
              Our AI analyzes the damage and instantly
              helps government officials prioritize
              compensation for affected farmers.

            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

              <Button
                text="Report Crop Damage"
                onClick={() => navigate("/farmer/login")}
                />

              <Button
                text="Government Portal"
                variant="secondary"
                onClick={() => navigate("/government/login")}
                />

            </div>

            <div className="mt-10 grid grid-cols-2 gap-5">

              <div className="bg-white rounded-xl shadow p-4">

                <h2 className="text-3xl font-bold text-green-700">
                  AI
                </h2>

                <p className="text-sm text-slate-600 mt-2">
                  Instant Crop Damage Detection
                </p>

              </div>

              <div className="bg-white rounded-xl shadow p-4">

                <h2 className="text-3xl font-bold text-blue-700">
                  GIS
                </h2>

                <p className="text-sm text-slate-600 mt-2">
                  Geo-tagged Field Reports
                </p>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="flex-1">

            <img
              src={hero}
              alt="AgriRelief AI Hero"
              className="w-full max-w-lg mx-auto"
            />

          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;