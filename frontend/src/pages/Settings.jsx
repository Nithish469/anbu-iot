
import { useState } from "react";

import {
  Building2,
  Clock,
  Globe,
  Bell,
  Save,
} from "lucide-react";

const DEFAULT_SETTINGS = {
  companyName: "Anbu IoT",
  companyCode: "AIOT",
  startTime: "09:00",
  endTime: "18:00",
  timezone: "Asia/Kolkata",
  lateAfter: "09:15",
  enableNotifications: true,
  autoCheckout: false,
};

function getSavedSettings() {
  try {
    const saved = localStorage.getItem("attendanceSettings");

    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Unable to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

function Settings() {
  const [settings, setSettings] = useState(getSavedSettings);

  const [saveMessage, setSaveMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaveMessage("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "attendanceSettings",
        JSON.stringify(settings)
      );

      setSaveMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Unable to save settings:", error);
      setSaveMessage("Unable to save settings. Please try again.");
    }
  };

  return (
    <div className="settings-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your attendance system settings</p>
        </div>
      </header>

      {/* Company Information */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Building2 size={20} />
          </div>

          <div>
            <h2>Company Information</h2>
            <p>Basic information about your organization</p>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-field">
            <label htmlFor="companyName">Company Name</label>

            <input
              id="companyName"
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="companyCode">Company Code</label>

            <input
              id="companyCode"
              type="text"
              name="companyCode"
              value={settings.companyCode}
              onChange={handleChange}
              placeholder="Enter company code"
            />
          </div>
        </div>
      </section>

      {/* Working Hours */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Clock size={20} />
          </div>

          <div>
            <h2>Working Hours</h2>
            <p>Configure your company's working schedule</p>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-field">
            <label htmlFor="startTime">Work Start Time</label>

            <input
              id="startTime"
              type="time"
              name="startTime"
              value={settings.startTime}
              onChange={handleChange}
            />
          </div>

          <div className="settings-field">
            <label htmlFor="endTime">Work End Time</label>

            <input
              id="endTime"
              type="time"
              name="endTime"
              value={settings.endTime}
              onChange={handleChange}
            />
          </div>

          <div className="settings-field">
            <label htmlFor="lateAfter">Late After</label>

            <input
              id="lateAfter"
              type="time"
              name="lateAfter"
              value={settings.lateAfter}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* Regional Settings */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Globe size={20} />
          </div>

          <div>
            <h2>Regional Settings</h2>
            <p>Configure timezone and regional preferences</p>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-field">
            <label htmlFor="timezone">Timezone</label>

            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
            >
              <option value="Asia/Kolkata">
                India (IST) - Asia/Kolkata
              </option>

              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </section>

      {/* Attendance Settings */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Bell size={20} />
          </div>

          <div>
            <h2>Attendance Settings</h2>
            <p>Configure attendance preferences</p>
          </div>
        </div>

        <div className="settings-options">
          <label className="setting-option">
            <div>
              <strong>Attendance Notifications</strong>
              <span>
                Enable notifications for attendance events
              </span>
            </div>

            <input
              type="checkbox"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
            />
          </label>

          <label className="setting-option">
            <div>
              <strong>Automatic Check-out</strong>
              <span>
                Enable automatic check-out preference at work end time
              </span>
            </div>

            <input
              type="checkbox"
              name="autoCheckout"
              checked={settings.autoCheckout}
              onChange={handleChange}
            />
          </label>
        </div>
      </section>

      {/* Save Settings */}
      <div className="settings-actions">
        {saveMessage && (
          <p
            className={
              saveMessage.includes("successfully")
                ? "settings-save-success"
                : "settings-save-error"
            }
            role="status"
          >
            {saveMessage}
          </p>
        )}

        <button
          type="button"
          className="save-settings-btn"
          onClick={handleSave}
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
