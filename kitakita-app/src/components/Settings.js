import React, { useState, useEffect } from "react";
import '../App.css';

export default function Settings() {
  // Load from localStorage
  const [name, setName] = useState(() => localStorage.getItem("userName") || "John Doe");
  const [email, setEmail] = useState(() => localStorage.getItem("userEmail") || "johndoe@example.com");
  const [photo, setPhoto] = useState(() => localStorage.getItem("userPhoto") || null);

  // Edit mode (only for profile)
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);

  // Sync temp values when not editing
  useEffect(() => {
    if (!isEditing) {
      setTempName(name);
      setTempEmail(email);
    }
  }, [isEditing, name, email]);

  // Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPhoto(base64);
        localStorage.setItem("userPhoto", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = () => setIsEditing(true);
  const saveProfile = () => {
    localStorage.setItem("userName", tempName.trim());
    localStorage.setItem("userEmail", tempEmail.trim());
    setName(tempName.trim());
    setEmail(tempEmail.trim());
    setIsEditing(false);
    alert("Profile updated successfully!");
  };
  const cancelEdit = () => {
    setTempName(name);
    setTempEmail(email);
    setIsEditing(false);
  };

  // Password & Delete (unchanged)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const changePassword = () => {
    if (newPassword !== confirmPassword) return alert("New passwords do not match!");
    if (!oldPassword || !newPassword) return alert("Please fill in all fields.");
    alert("Password changed successfully!");
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const deleteAccount = () => {
    if (!confirmDelete || deleteText !== "DELETE") return;
    if (window.confirm("FINAL WARNING: This will delete everything permanently.")) {
      localStorage.clear();
      alert("Account deleted. All data removed.");
      setName("John Doe"); setEmail("johndoe@example.com"); setPhoto(null);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      {/* PROFILE – Edit mode */}
      <div className="section">
        <h2>Profile Information</h2>
        <div className="profile-picture-wrapper">
          <img src={photo || "https://via.placeholder.com/120"} alt="Profile" className="profile-img" />
          {isEditing && (
            <>
              <label htmlFor="photo-upload" className="change-photo-text">Change photo</label>
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{display: "none"}} />
            </>
          )}
        </div>

        <div className="form-fields">
          <div className="field">
            <label>Name</label>
            <input type="text" value={isEditing ? tempName : name} onChange={(e) => setTempName(e.target.value)} disabled={!isEditing} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={isEditing ? tempEmail : email} onChange={(e) => setTempEmail(e.target.value)} disabled={!isEditing} />
          </div>

          <div style={{ marginTop: "24px" }}>
            {isEditing ? (
              <>
                <button onClick={saveProfile} className="save-btn">Save Profile</button>
                <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
              </>
            ) : (
              <button onClick={startEdit} className="edit-profile-btn">Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD – unchanged */}
      <div className="section">
        <h2>Change Password</h2>
        <div className="form-fields">
          <div className="field"><label>Old Password</label><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} /></div>
          <div className="field"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <div className="field"><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
          <button onClick={changePassword} className="save-btn">Update Password</button>
        </div>
      </div>

      {/* DELETE ACCOUNT – unchanged */}
      <div className="section delete-section">
        <h2>Delete Account</h2>
        <div className="form-fields">
          <p className="delete-warning">
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>
          <div className="field">
            <label>
              <input type="checkbox" checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} />
              <span> I understand that this action is permanent and irreversible</span>
            </label>
          </div>
          <div className="field">
            <label>Type <strong>DELETE</strong> to confirm</label>
            <input type="text" value={deleteText} onChange={(e) => setDeleteText(e.target.value.toUpperCase())} placeholder="DELETE" style={{textTransform: "uppercase"}} />
          </div>
          <button onClick={deleteAccount} className="delete-btn" disabled={!(confirmDelete && deleteText === "DELETE")}>
            Delete My Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}