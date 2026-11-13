
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Profile.css'

const sections = [
  { id: 'personal', icon: '', label: 'Personal' },
  { id: 'farm', icon: '', label: 'Farm Information' },
  { id: 'security', icon: '', label: 'Security' },
  { id: 'notifications', icon: '', label: 'Notifications' },
  { id: 'preferences', icon: '', label: 'Preferences' },
  { id: 'activity', icon: '', label: 'Account Activity' },
  { id: 'support', icon: '', label: 'Help & Support' },
]

const defaultSettings = {
  email_notifications: true,
  climate_alerts: true,
  crop_reminders: true,
  temperature_unit: 'C',
  measurement_unit: 'hectares',
  currency: 'GHS',
}

const emptyFarm = {
  farm_name: '',
  location: '',
  latitude: '',
  longitude: '',
  farm_size: '',
  size_unit: 'hectares',
  soil_type: '',
  description: '',
}

function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const { theme, updateTheme, themeSaving } = useTheme()

  const [activeSection, setActiveSection] = useState('personal')

  // Personal profile
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  // Farm information
  const [farms, setFarms] = useState([])
  const [farmForm, setFarmForm] = useState(emptyFarm)
  const [editingFarmId, setEditingFarmId] = useState(null)
  const [farmLoading, setFarmLoading] = useState(false)
  const [farmsLoading, setFarmsLoading] = useState(true)

  // Preferences and notifications
  const [settings, setSettings] = useState(defaultSettings)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Account activity
  const [activities, setActivities] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Security
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // General messages
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function showMessage(text) {
    setMessage(text)
    setError('')
  }

  function showError(text) {
    setError(text)
    setMessage('')
  }

  // Record an activity without interrupting the main action if logging fails.
  async function recordActivity(activityType, description) {
    if (!user) return

    const { error: activityError } = await supabase
      .from('account_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        description,
      })

    if (activityError) {
      console.error('Activity recording error:', activityError.message)
    }
  }

  // Load existing personal information.
  useEffect(() => {
    if (!profile) return

    setFullName(profile.full_name || '')
    setPhone(profile.phone || '')
    setAddress(profile.address || '')
    setAvatarPath(profile.avatar_url || '')
  }, [profile])

  // Load a fresh signed URL for the private avatar.
  useEffect(() => {
    let active = true

    async function loadAvatar() {
      if (!avatarPath || !user) {
        setAvatarUrl('')
        return
      }

      const { data, error: avatarError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 3600)

      if (!active) return

      if (avatarError) {
        console.error('Avatar loading error:', avatarError.message)
        setAvatarUrl('')
        return
      }

      setAvatarUrl(data?.signedUrl || '')
    }

    loadAvatar()

    return () => {
      active = false
    }
  }, [avatarPath, user?.id])

  // Load this user's farms.
  async function loadFarms() {
    if (!user) return

    setFarmsLoading(true)

    const { data, error: farmError } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (farmError) {
      console.error('Farm loading error:', farmError.message)
      showError('Unable to load your farm information.')
    } else {
      setFarms(data || [])
    }

    setFarmsLoading(false)
  }

  // Load saved preferences, creating a default row for new users.
  async function loadSettings() {
    if (!user) return

    setSettingsLoading(true)

    const { data, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('Settings loading error:', settingsError.message)
      showError('Unable to load your preferences.')
      setSettingsLoading(false)
      return
    }

    if (data) {
      setSettings({
        ...defaultSettings,
        email_notifications: data.email_notifications,
        climate_alerts: data.climate_alerts,
        crop_reminders: data.crop_reminders,
        temperature_unit: data.temperature_unit || 'C',
        measurement_unit: data.measurement_unit || 'hectares',
        currency: data.currency || 'GHS',
      })
    } else {
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings,
          theme: 'light',
        })

      if (insertError) {
        console.error('Default settings creation error:', insertError.message)
      } else {
        setSettings(defaultSettings)
      }
    }

    setSettingsLoading(false)
  }

  // Load this user's recent activity.
  async function loadActivities() {
    if (!user) return

    setActivityLoading(true)

    const { data, error: activityError } = await supabase
      .from('account_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (activityError) {
      console.error('Activity loading error:', activityError.message)
    } else {
      setActivities(data || [])
    }

    setActivityLoading(false)
  }

  useEffect(() => {
    if (!user) return

    loadFarms()
    loadSettings()
    loadActivities()
  }, [user?.id])

  // Profile picture selection and validation.
  function handleFileChange(event) {
    const file = event.target.files?.[0]

    setError('')
    setMessage('')

    if (!file) return

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Your profile picture must be smaller than 5 MB.')
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Upload avatar to the existing private avatars bucket.
  async function handleAvatarUpload() {
    if (!selectedFile || !user) return

    setUploading(true)
    setError('')
    setMessage('')

    let uploadedPath = ''

    try {
      const extension = selectedFile.name.split('.').pop().toLowerCase()
      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          upsert: false,
          contentType: selectedFile.type,
        })

      if (uploadError) throw uploadError

      uploadedPath = filePath

      const { data, error: saveError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            avatar_url: filePath,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (saveError) throw saveError

      setAvatarPath(data.avatar_url)
      setSelectedFile(null)

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')

      await refreshProfile()
      await recordActivity('profile', 'Updated profile picture')

      showMessage('Your profile picture has been uploaded and saved.')
      loadActivities()
    } catch (err) {
      console.error('Avatar upload error:', err)

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from('avatars')
          .remove([uploadedPath])

        if (cleanupError) {
          console.error('Avatar cleanup error:', cleanupError.message)
        }
      }

      showError(err.message || 'Unable to upload your profile picture.')
    } finally {
      setUploading(false)
    }
  }

  // Save personal information.
  async function handleProfileSubmit(event) {
    event.preventDefault()

    if (!user) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: saveError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            avatar_url: avatarPath || profile?.avatar_url || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (saveError) throw saveError

      await refreshProfile()
      await recordActivity('profile', 'Updated personal profile information')

      showMessage('Your profile information has been saved successfully.')
      loadActivities()
    } catch (err) {
      console.error('Profile saving error:', err)
      showError(err.message || 'Unable to save your profile.')
    } finally {
      setLoading(false)
    }
  }

  // Farm form helpers.
  function handleFarmChange(event) {
    const { name, value } = event.target

    setFarmForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetFarmForm() {
    setFarmForm(emptyFarm)
    setEditingFarmId(null)
  }

  function editFarm(farm) {
    setFarmForm({
      farm_name: farm.farm_name || '',
      location: farm.location || '',
      latitude: farm.latitude ?? '',
      longitude: farm.longitude ?? '',
      farm_size: farm.farm_size ?? '',
      size_unit: farm.size_unit || 'hectares',
      soil_type: farm.soil_type || '',
      description: farm.description || '',
    })

    setEditingFarmId(farm.id)
    setMessage('')
    setError('')
    document.getElementById('farm-editor')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  async function handleFarmSubmit(event) {
    event.preventDefault()

    if (!user) return

    setFarmLoading(true)
    setError('')
    setMessage('')

    const farmData = {
      user_id: user.id,
      farm_name: farmForm.farm_name.trim(),
      location: farmForm.location.trim(),
      latitude: farmForm.latitude === '' ? null : Number(farmForm.latitude),
      longitude: farmForm.longitude === '' ? null : Number(farmForm.longitude),
      farm_size: farmForm.farm_size === '' ? null : Number(farmForm.farm_size),
      size_unit: farmForm.size_unit,
      soil_type: farmForm.soil_type || null,
      description: farmForm.description.trim() || null,
      updated_at: new Date().toISOString(),
    }

    try {
      let result

      if (editingFarmId) {
        result = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingFarmId)
          .eq('user_id', user.id)
      } else {
        result = await supabase
          .from('farms')
          .insert(farmData)
      }

      if (result.error) throw result.error

      await recordActivity(
        'farm',
        editingFarmId ? 'Updated farm information' : 'Added a farm'
      )

      resetFarmForm()
      await loadFarms()
      await loadActivities()

      showMessage(
        editingFarmId
          ? 'Farm information updated successfully.'
          : 'Your farm has been added successfully.'
      )
    } catch (err) {
      console.error('Farm saving error:', err)
      showError(err.message || 'Unable to save farm information.')
    } finally {
      setFarmLoading(false)
    }
  }

  async function deleteFarm(farmId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this farm? This action cannot be undone.'
    )

    if (!confirmed || !user) return

    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('farms')
      .delete()
      .eq('id', farmId)
      .eq('user_id', user.id)

    if (deleteError) {
      showError(deleteError.message || 'Unable to delete this farm.')
      return
    }

    await recordActivity('farm', 'Deleted a farm')
    await loadFarms()
    await loadActivities()

    if (editingFarmId === farmId) resetFarmForm()

    showMessage('Farm deleted successfully.')
  }

  // Save a notification or general preference.
  async function saveSetting(key, value) {
    if (!user) return

    const allowedKeys = [
      'email_notifications',
      'climate_alerts',
      'crop_reminders',
      'temperature_unit',
      'measurement_unit',
      'currency',
    ]

    if (!allowedKeys.includes(key)) return

    const previousValue = settings[key]

    setSettings((current) => ({
      ...current,
      [key]: value,
    }))

    setSettingsSaving(true)
    setError('')
    setMessage('')

    const { error: saveError } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    setSettingsSaving(false)

    if (saveError) {
      console.error('Preference saving error:', saveError.message)

      setSettings((current) => ({
        ...current,
        [key]: previousValue,
      }))

      showError('Unable to save this preference. Please try again.')
      return
    }

    await recordActivity('settings', `Changed ${key.replaceAll('_', ' ')}`)
    showMessage('Your preference has been saved.')
    loadActivities()
  }

  // Change this user's theme using ThemeContext.
  async function handleThemeChange(newTheme) {
    setError('')
    setMessage('')

    const { error: themeError } = await updateTheme(newTheme)

    if (themeError) {
      showError('Unable to save your theme. Please try again.')
      return
    }

    await recordActivity(
      'settings',
      `Changed appearance to ${newTheme} mode`
    )

    showMessage(
      `${newTheme === 'dark' ? 'Dark' : 'Light'} mode has been saved to your account.`
    )

    loadActivities()
  }

  // Update password for the currently authenticated account.
  async function handlePasswordSubmit(event) {
    event.preventDefault()

    if (newPassword.length < 8) {
      showError('Your new password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('Your password confirmation does not match.')
      return
    }

    setPasswordLoading(true)
    setError('')
    setMessage('')

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setPasswordLoading(false)

    if (passwordError) {
      showError(passwordError.message || 'Unable to update your password.')
      return
    }

    setNewPassword('')
    setConfirmPassword('')

    await recordActivity('security', 'Changed account password')
    showMessage('Your password has been updated successfully.')
    loadActivities()
  }

  const displayedAvatar = previewUrl || avatarUrl
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  function renderPersonal() {
    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">YOUR ACCOUNT</span>
          <h2>Personal Information</h2>
          <p>Manage your name, contact information and profile picture.</p>
        </div>

        <div className="profile-picture-section">
          <div className="profile-avatar">
            {displayedAvatar ? (
              <img src={displayedAvatar} alt="Your profile" />
            ) : (
              <span>{initials || 'F'}</span>
            )}
          </div>

          <div className="profile-picture-info">
            <h3>Profile Picture</h3>
            <p>Choose a clear picture of yourself.</p>

            <label className="profile-upload-button">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>

            {selectedFile && (
              <button
                type="button"
                className="profile-save-picture"
                onClick={handleAvatarUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload & Save Picture'}
              </button>
            )}

            <small>Image formats supported. Maximum file size: 5 MB.</small>
          </div>
        </div>

        <div className="profile-divider" />

        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              readOnly
            />
            <small>Your email address is managed through authentication.</small>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-phone">Phone Number</label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-address">Residential Address</label>
            <textarea
              id="profile-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter your town, region or address"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="profile-submit-button"
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </>
    )
  }

  function renderFarm() {
    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">YOUR AGRICULTURE</span>
          <h2>Farm Information</h2>
          <p>Manage your farms using your existing AgroShift farm records.</p>
        </div>

        <div className="profile-farm-list">
          {farmsLoading ? (
            <p className="profile-muted">Loading your farms...</p>
          ) : farms.length === 0 ? (
            <div className="profile-empty">
              <span>🌱</span>
              <h3>No farms added yet</h3>
              <p>Add your first farm using the form below.</p>
            </div>
          ) : (
            farms.map((farm) => (
              <div className="profile-farm-item" key={farm.id}>
                <div className="profile-farm-icon">🌾</div>
                <div className="profile-farm-details">
                  <h3>{farm.farm_name}</h3>
                  <p>{farm.location || 'Location not provided'}</p>
                  <small>
                    {farm.farm_size ?? 'Size not provided'}{' '}
                    {farm.farm_size ? farm.size_unit : ''}
                    {farm.soil_type ? ` · ${farm.soil_type} soil` : ''}
                  </small>
                </div>
                <div className="profile-farm-actions">
                  <button type="button" onClick={() => editFarm(farm)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="profile-delete-button"
                    onClick={() => deleteFarm(farm.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="profile-divider" />

        <form
          id="farm-editor"
          className="profile-form"
          onSubmit={handleFarmSubmit}
        >
          <div className="profile-form-heading">
            <h3>{editingFarmId ? 'Edit Farm' : 'Add a Farm'}</h3>
            <p>Enter the details of your farm below.</p>
          </div>

          <div className="profile-field">
            <label htmlFor="farm-name">Farm Name</label>
            <input
              id="farm-name"
              name="farm_name"
              value={farmForm.farm_name}
              onChange={handleFarmChange}
              placeholder="e.g. Green Valley Farm"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="farm-location">Farm Location</label>
            <input
              id="farm-location"
              name="location"
              value={farmForm.location}
              onChange={handleFarmChange}
              placeholder="Town, district or region"
            />
          </div>

          <div className="profile-grid-two">
            <div className="profile-field">
              <label htmlFor="farm-latitude">Latitude</label>
              <input
                id="farm-latitude"
                type="number"
                step="any"
                name="latitude"
                value={farmForm.latitude}
                onChange={handleFarmChange}
                placeholder="e.g. 4.90"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="farm-longitude">Longitude</label>
              <input
                id="farm-longitude"
                type="number"
                step="any"
                name="longitude"
                value={farmForm.longitude}
                onChange={handleFarmChange}
                placeholder="e.g. -1.75"
              />
            </div>
          </div>

          <div className="profile-grid-two">
            <div className="profile-field">
              <label htmlFor="farm-size">Farm Size</label>
              <input
                id="farm-size"
                type="number"
                min="0"
                step="any"
                name="farm_size"
                value={farmForm.farm_size}
                onChange={handleFarmChange}
                placeholder="Enter farm size"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="farm-unit">Size Unit</label>
              <select
                id="farm-unit"
                name="size_unit"
                value={farmForm.size_unit}
                onChange={handleFarmChange}
              >
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
              </select>
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="farm-soil">Soil Type</label>
            <select
              id="farm-soil"
              name="soil_type"
              value={farmForm.soil_type}
              onChange={handleFarmChange}
            >
              <option value="">Select soil type</option>
              <option value="Loamy">Loamy</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Silty">Silty</option>
              <option value="Sandy loam">Sandy loam</option>
              <option value="Clay loam">Clay loam</option>
              <option value="Other">Other / Not sure</option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="farm-description">Description</label>
            <textarea
              id="farm-description"
              name="description"
              rows={3}
              value={farmForm.description}
              onChange={handleFarmChange}
              placeholder="Describe your farm..."
            />
          </div>

          <div className="profile-button-row">
            <button
              type="submit"
              className="profile-submit-button"
              disabled={farmLoading}
            >
              {farmLoading
                ? 'Saving Farm...'
                : editingFarmId
                  ? 'Update Farm'
                  : 'Add Farm'}
            </button>

            {editingFarmId && (
              <button
                type="button"
                className="profile-cancel-button"
                onClick={resetFarmForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </>
    )
  }

  function renderSecurity() {
    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">ACCOUNT PROTECTION</span>
          <h2>Security</h2>
          <p>Keep your AgroShift account secure.</p>
        </div>

        <div className="profile-info-row">
          <div>
            <strong>Account email</strong>
            <p>{user?.email || 'No email available'}</p>
          </div>
          <span className="profile-status">Active session</span>
        </div>

        <div className="profile-divider" />

        <form className="profile-form" onSubmit={handlePasswordSubmit}>
          <div className="profile-form-heading">
            <h3>Change Password</h3>
            <p>Choose a strong password with at least 8 characters.</p>
          </div>

          <div className="profile-field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>

          <button
            type="submit"
            className="profile-submit-button"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="profile-security-note">
          <strong>Account deletion</strong>
          <p>
            For account deletion, contact AgroShift support. This action
            requires a secure server-side process and cannot safely be
            performed using the browser alone.
          </p>
        </div>
      </>
    )
  }

  function renderNotifications() {
    const options = [
      {
        key: 'email_notifications',
        title: 'Email Notifications',
        description: 'Receive important AgroShift updates by email.',
      },
      {
        key: 'climate_alerts',
        title: 'Climate Alerts',
        description: 'Enable alerts related to climate and weather information.',
      },
      {
        key: 'crop_reminders',
        title: 'Crop Planning Reminders',
        description: 'Keep reminders for your crop planning activities.',
      },
    ]

    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">STAY INFORMED</span>
          <h2>Notifications</h2>
          <p>Choose which types of notifications you want to receive.</p>
        </div>

        {settingsLoading ? (
          <p className="profile-muted">Loading notification settings...</p>
        ) : (
          <div className="profile-setting-list">
            {options.map((option) => (
              <div className="profile-setting-row" key={option.key}>
                <div>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </div>

                <label className="profile-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings[option.key])}
                    onChange={(event) =>
                      saveSetting(option.key, event.target.checked)
                    }
                    disabled={settingsSaving}
                  />
                  <span className="profile-switch-slider" />
                </label>
              </div>
            ))}
          </div>
        )}

        <p className="profile-help-note">
          These settings store your notification preferences. Actual email
          and push delivery must be connected to notification services
          separately.
        </p>
      </>
    )
  }

  function renderPreferences() {
    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">MAKE IT YOURS</span>
          <h2>Preferences</h2>
          <p>Choose how AgroShift looks and how information is displayed.</p>
        </div>

        <div className="profile-preference-group">
          <div className="profile-preference-heading">
            <div>
              <h3>Appearance</h3>
              <p>Your theme is saved to your own account.</p>
            </div>
          </div>

          <div className="profile-theme-options">
            <button
              type="button"
              className={`profile-theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
              disabled={themeSaving}
            >
              <span className="profile-theme-preview light-preview">
                <span />
                <span />
                <span />
              </span>
              <span className="profile-theme-label">
                <span></span>
                Light Mode
              </span>
              {theme === 'light' && <span className="profile-theme-check">✓</span>}
            </button>

            <button
              type="button"
              className={`profile-theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
              disabled={themeSaving}
            >
              <span className="profile-theme-preview dark-preview">
                <span />
                <span />
                <span />
              </span>
              <span className="profile-theme-label">
                <span></span>
                Dark Mode
              </span>
              {theme === 'dark' && <span className="profile-theme-check">✓</span>}
            </button>
          </div>

          <small className="profile-help-note">
            {themeSaving
              ? 'Saving your theme...'
              : `Your current appearance is ${theme} mode.`}
          </small>
        </div>

        <div className="profile-divider" />

        <div className="profile-preference-group">
          <h3>Regional Settings</h3>
          <p className="profile-muted">
            Choose the units and currency used in your AgroShift account.
          </p>

          {settingsLoading ? (
            <p className="profile-muted">Loading preferences...</p>
          ) : (
            <>
              <div className="profile-field">
                <label htmlFor="temperature-unit">Temperature Unit</label>
                <select
                  id="temperature-unit"
                  value={settings.temperature_unit}
                  onChange={(event) =>
                    saveSetting('temperature_unit', event.target.value)
                  }
                  disabled={settingsSaving}
                >
                  <option value="C">Celsius (°C)</option>
                  <option value="F">Fahrenheit (°F)</option>
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="measurement-unit">Farm Measurement</label>
                <select
                  id="measurement-unit"
                  value={settings.measurement_unit}
                  onChange={(event) =>
                    saveSetting('measurement_unit', event.target.value)
                  }
                  disabled={settingsSaving}
                >
                  <option value="hectares">Hectares</option>
                  <option value="acres">Acres</option>
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(event) =>
                    saveSetting('currency', event.target.value)
                  }
                  disabled={settingsSaving}
                >
                  <option value="GHS">Ghana Cedi (GHS)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  function renderActivity() {
    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">YOUR ACCOUNT HISTORY</span>
          <h2>Account Activity</h2>
          <p>Review recent changes recorded in your AgroShift account.</p>
        </div>

        {activityLoading ? (
          <p className="profile-muted">Loading account activity...</p>
        ) : activities.length === 0 ? (
          <div className="profile-empty">
            <span></span>
            <h3>No activity recorded yet</h3>
            <p>Your recorded profile and settings changes will appear here.</p>
          </div>
        ) : (
          <div className="profile-activity-list">
            {activities.map((activity) => (
              <div className="profile-activity-item" key={activity.id}>
                <div className="profile-activity-dot" />
                <div>
                  <h3>{activity.description}</h3>
                  <p>
                    {activity.activity_type} ·{' '}
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="profile-help-note">
          This list shows actions recorded by AgroShift. It is not a complete
          security audit or a full login history.
        </p>
      </>
    )
  }

  function renderSupport() {
    return (
      <>
        <div className="profile-section-title">
          <span className="profile-section-kicker">WE ARE HERE TO HELP</span>
          <h2>Help & Support</h2>
          <p>Find help with your AgroShift account and features.</p>
        </div>

        <div className="profile-support-card">
          <span></span>
          <div>
            <h3>Using AgroShift</h3>
            <p>
              Use the Dashboard to review your farming information, Farm
              Assessment to manage farm details, Climate Insights to explore
              climate data and Crop Planner to review crop recommendations.
            </p>
          </div>
        </div>

        <div className="profile-support-card">
          <span></span>
          <div>
            <h3>Account and privacy</h3>
            <p>
              Your profile, farm information, preferences and activity are
              protected by Supabase authentication and database access
              policies.
            </p>
          </div>
        </div>

        <div className="profile-support-card">
          <span></span>
          <div>
            <h3>Need assistance?</h3>
            <p>
              If you encounter a problem, keep a note of the page, what you
              were doing and any error message. This information will help
              support diagnose the issue.
            </p>
          </div>
        </div>

        <div className="profile-security-note">
          <strong>Important</strong>
          <p>
            Do not share your password, Supabase keys or account recovery
            codes when requesting technical assistance.
          </p>
        </div>
      </>
    )
  }

  const sectionContent = {
    personal: renderPersonal,
    farm: renderFarm,
    security: renderSecurity,
    notifications: renderNotifications,
    preferences: renderPreferences,
    activity: renderActivity,
    support: renderSupport,
  }

  const activeItem = sections.find((item) => item.id === activeSection)

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <span className="profile-eyebrow">AGROSHIFT ACCOUNT</span>
          <h1>Profile & Settings</h1>
          <p>Manage your personal information, farms and account preferences.</p>
        </div>
      </div>

      {error && (
        <div className="profile-alert profile-alert-error">{error}</div>
      )}

      {message && (
        <div className="profile-alert profile-alert-success">{message}</div>
      )}

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-sidebar-user">
            <div className="profile-sidebar-avatar">
              {displayedAvatar ? (
                <img src={displayedAvatar} alt="Your profile" />
              ) : (
                initials || 'F'
              )}
            </div>
            <div className="profile-sidebar-user-info">
              <strong>{fullName || 'Farmer'}</strong>
              <span>{user?.email || 'AgroShift account'}</span>
            </div>
          </div>

          <span className="profile-sidebar-label">ACCOUNT MENU</span>

          <nav className="profile-navigation" aria-label="Profile settings">
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={`profile-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.id)
                  setError('')
                  setMessage('')
                }}
              >
                <span className="profile-nav-icon">{section.icon}</span>
                <span>{section.label}</span>
                {activeSection === section.id && (
                  <span className="profile-nav-indicator" />
                )}
              </button>
            ))}
          </nav>

          <div className="profile-sidebar-footer">
            <span className="profile-sidebar-theme">
              {theme === 'dark' ? ' Dark Mode' : ' Light Mode'}
            </span>
            <small>Your settings are personal to your account.</small>
          </div>
        </aside>

        <main className="profile-content">
          <div className="profile-content-heading">
            <div>
              <span className="profile-content-icon">{activeItem?.icon}</span>
              <div>
                <h2>{activeItem?.label}</h2>
                <p>Manage your {activeItem?.label.toLowerCase()} settings.</p>
              </div>
            </div>
          </div>

          <div className="profile-content-body">
            {sectionContent[activeSection]()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Profile
