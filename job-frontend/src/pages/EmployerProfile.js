import { useEffect, useState } from "react";
import API from "../services/api";

function EmployerProfile() {

    const employerId = localStorage.getItem("userId");

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        companyDescription: "",
        companyWebsite: "",
        companyLogo: "",
        companyAddress: "",
        contactNumber: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const res = await API.get(`/employer/${employerId}`);

            setProfile({
                name: res.data.name || "",
                email: res.data.email || "",
                companyDescription: res.data.companyDescription || "",
                companyWebsite: res.data.companyWebsite || "",
                companyLogo: res.data.companyLogo || "",
                companyAddress: res.data.companyAddress || "",
                contactNumber: res.data.contactNumber || ""
            });

        } catch (err) {

            console.log(err);

            alert("Unable to load company profile.");

        } finally {

            setLoading(false);

        }

    };

    const handleChange = (e) => {

        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });

    };

    const saveProfile = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            await API.put(`/employer/${employerId}`, profile);

            alert("Company Profile Updated Successfully");

        } catch (err) {

            console.log(err);

            alert("Failed to update profile");

        } finally {

            setSaving(false);

        }

    };

    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <h2 className="text-3xl font-bold">
                    Loading Company Profile...
                </h2>

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8">

                <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">
                    Company Profile
                </h1>

                <form
                    onSubmit={saveProfile}
                    className="space-y-6"
                >

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>

                            <label className="font-semibold block mb-2">
                                Company Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            />

                        </div>

                        <div>

                            <label className="font-semibold block mb-2">
                                Company Email
                            </label>

                            <input
                                type="email"
                                value={profile.email}
                                readOnly
                                className="w-full border rounded-lg p-3 bg-gray-100"
                            />

                        </div>

                    </div>

                    <div>

                        <label className="font-semibold block mb-2">
                            Company Description
                        </label>

                        <textarea
                            rows="5"
                            name="companyDescription"
                            value={profile.companyDescription}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-3"
                            placeholder="Describe your company..."
                        />

                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>

                            <label className="font-semibold block mb-2">
                                Company Website
                            </label>

                            <input
                                type="url"
                                name="companyWebsite"
                                value={profile.companyWebsite}
                                onChange={handleChange}
                                placeholder="https://company.com"
                                className="w-full border rounded-lg p-3"
                            />

                        </div>

                        <div>

                            <label className="font-semibold block mb-2">
                                Contact Number
                            </label>

                            <input
                                type="text"
                                name="contactNumber"
                                value={profile.contactNumber}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>

                    </div>

                    <div>

                        <label className="font-semibold block mb-2">
                            Company Address
                        </label>

                        <input
                            type="text"
                            name="companyAddress"
                            value={profile.companyAddress}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                    <div>

                        <label className="font-semibold block mb-2">
                            Company Logo URL
                        </label>

                        <input
                            type="text"
                            name="companyLogo"
                            value={profile.companyLogo}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                    {profile.companyLogo && (

                        <div className="flex justify-center">

                            <img
                                src={profile.companyLogo}
                                alt="Company Logo"
                                className="h-36 w-36 rounded-full border shadow object-cover"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />

                        </div>

                    )}

                    <div className="flex justify-center gap-5">

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold"
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>

                        <button
                            type="button"
                            onClick={loadProfile}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-10 py-3 rounded-lg font-semibold"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default EmployerProfile;