import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function CompanyProfile() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompany();
    }, [id]);

    const loadCompany = async () => {

        try {

            const res = await API.get(`/employer/${id}`);

            setCompany(res.data);

        } catch (err) {

            console.log(err);
            alert("Unable to load company profile");

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <h2 className="text-3xl font-bold">
                    Loading...
                </h2>

            </div>

        );

    }

    if (!company) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <h2 className="text-3xl font-bold">
                    Company Not Found
                </h2>

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-xl shadow-lg p-8">

                    <div className="flex flex-col md:flex-row gap-8">

                        <img
                            src={
                                company.companyLogo
                                    ? company.companyLogo
                                    : "https://via.placeholder.com/180"
                            }
                            alt="Company Logo"
                            className="w-44 h-44 object-contain border rounded-lg"
                        />

                        <div className="flex-1">

                            <h1 className="text-4xl font-bold text-blue-600">

                                {company.name}

                            </h1>

                            <p className="mt-5 text-gray-700 leading-7">

                                {company.companyDescription ||
                                    "No company description available."}

                            </p>

                            <div className="mt-6 space-y-3">

                                <p>

                                    <strong>Website :</strong>{" "}

                                    {company.companyWebsite ? (

                                        <a
                                            href={company.companyWebsite}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            {company.companyWebsite}
                                        </a>

                                    ) : (

                                        "Not Available"

                                    )}

                                </p>

                                <p>

                                    <strong>Address :</strong>{" "}

                                    {company.companyAddress || "Not Available"}

                                </p>

                                <p>

                                    <strong>Contact :</strong>{" "}

                                    {company.contactNumber || "Not Available"}

                                </p>

                                <p>

                                    <strong>Email :</strong>{" "}

                                    {company.email}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 mt-10">

                    <h2 className="text-3xl font-bold mb-5">

                        Open Positions

                    </h2>

                    <div className="text-gray-600 text-lg">

                        Company jobs will be displayed in Step 34.

                    </div>

                </div>

                <div className="mt-8">

                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Back
                    </button>

                </div>

            </div>

        </div>

    );

}

export default CompanyProfile;