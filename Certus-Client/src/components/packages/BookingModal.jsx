import React, { useState } from "react";
import { X, CheckCircle, Calendar, Clock, MapPin, User, Phone, Mail, ShieldCheck, Home, Building2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

/**
 * BookingModal Component
 * Sleek, high-converting test booking modal for patients in the Certus Client App.
 * Handles appointment scheduling, sample collection type selection, and instant confirmation.
 */
export default function BookingModal({ isOpen, onClose, package: pkg }) {
  const { user, isLoggedIn } = useAuth();
  
  const [step, setStep] = useState("form"); // "form" | "submitting" | "success"
  const [collectionType, setCollectionType] = useState("home"); // "home" | "center"
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow by default
    timeSlot: "Morning (07:00 AM - 10:00 AM)",
    address: "",
    notes: ""
  });
  const [bookingId, setBookingId] = useState("");

  if (!isOpen || !pkg) return null;

  const priceFormatted = pkg.price
    ? `₹${Number(pkg.price).toLocaleString("en-IN")}`
    : "Price on Request";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep("submitting");

    // Simulate API booking delay with real-feeling confirmation generator
    setTimeout(() => {
      const generatedId = "CRT-" + Math.floor(100000 + Math.random() * 900000);
      setBookingId(generatedId);
      setStep("success");
    }, 1500);
  };

  const handleResetAndClose = () => {
    setStep("form");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-white/20 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Book Diagnostic Test</span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2.5 py-0.5 rounded-full">
                Instant Confirmation
              </span>
            </h3>
            <p className="text-sm text-gray-300 mt-0.5">
              {pkg.name} — <span className="text-emerald-400 font-bold">{priceFormatted}</span>
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === "success" ? (
            /* Success View */
            <div className="py-8 text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white">Booking Confirmed!</h4>
                <p className="text-gray-300 max-w-md mx-auto">
                  Your appointment for <strong className="text-white">{pkg.name}</strong> has been scheduled successfully.
                </p>
              </div>

              {/* Booking Reference Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking ID</span>
                  <span className="text-sm font-mono font-bold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30">
                    {bookingId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block">Date & Time</span>
                    <span className="text-white font-medium">{formData.date}</span>
                    <span className="text-gray-300 text-xs block">{formData.timeSlot.split(" ")[0]}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Collection Type</span>
                    <span className="text-white font-medium capitalize flex items-center gap-1">
                      {collectionType === "home" ? <Home className="w-3.5 h-3.5 text-blue-400" /> : <Building2 className="w-3.5 h-3.5 text-purple-400" />}
                      {collectionType === "home" ? "Home Collection" : "Center Visit"}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Our executive will call {formData.phone || "your registered number"} shortly.</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                >
                  Done & Back to Tests
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Collection Type Selector */}
              <div>
                <label className="text-sm font-semibold text-gray-200 block mb-3">
                  Select Sample Collection Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCollectionType("home")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      collectionType === "home"
                        ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 text-white"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${collectionType === "home" ? "bg-blue-600 text-white" : "bg-white/10 text-gray-400"}`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Home Collection</div>
                      <div className="text-xs text-emerald-400 font-medium mt-0.5">Free Sample Pickup</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionType("center")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      collectionType === "center"
                        ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/10 text-white"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${collectionType === "center" ? "bg-purple-600 text-white" : "bg-white/10 text-gray-400"}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Center Visit</div>
                      <div className="text-xs text-gray-400 font-medium mt-0.5">Visit nearest Certus Lab</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Preferred Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/80 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Time Slot</span>
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-sm"
                  >
                    <option value="Morning (07:00 AM - 10:00 AM)">Morning (07:00 AM - 10:00 AM)</option>
                    <option value="Mid-Day (10:00 AM - 01:00 PM)">Mid-Day (10:00 AM - 01:00 PM)</option>
                    <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                    <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Patient Info */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Patient Contact Details</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Patient Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-800/80 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number (10 digits)"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      className="w-full bg-slate-800/80 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                    />
                  </div>
                </div>

                {collectionType === "home" && (
                  <div>
                    <textarea
                      name="address"
                      rows="2"
                      placeholder="Complete Address for Home Sample Collection (House No, Street, Landmark, Pincode)"
                      value={formData.address}
                      onChange={handleChange}
                      required={collectionType === "home"}
                      className="w-full bg-slate-800/80 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit Section */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No pre-payment required. Pay online or via cash at collection.</span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold border border-white/15 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={step === "submitting"}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 disabled:opacity-50 text-sm flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {step === "submitting" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <span>Confirm & Book ({priceFormatted})</span>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
