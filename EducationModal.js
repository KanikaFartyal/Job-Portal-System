import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconX,
  IconPlus,
  IconCheck,
  IconArrowRight,
  IconTrash,
} from '@tabler/icons-react';

const educationTypes = ['High School', 'Intermediate', 'Bachelors', 'Masters'];
const bachelorDegrees = ['BCA', 'BBA', 'BTech', 'BCom', 'BSc', 'BA', 'B.Tech', 'B.Sc', 'B.A.'];
const masterDegrees = ['MCA', 'MBA', 'MTech', 'MSc', 'MA', 'M.Tech', 'M.Sc', 'M.A.'];
const gradingSystems = ['Scale 10 Grading System', 'Scale 4 Grading System', '% Marks of 100 Maximum', 'Course Requires a Pass'];
const courseTypes = ['Full time', 'Part time', 'Correspondence'];
const yearOptions = Array.from({ length: 30 }, (_, i) => `${2000 + i}`);

export default function EducationModal({ isOpen, onClose, onSave, editingEntry = null }) {
  const [formData, setFormData] = useState(
    editingEntry || {
      _id: `temp-${Date.now()}`,
      type: '',
      degree: '',
      collegeName: '',
      universityName: '',
      schoolName: '',
      boardName: '',
      courseName: '',
      startYear: '',
      endYear: '',
      current: false,
      expectedGraduationYear: '',
      gradingSystem: '',
      cgpa: '',
      percentage: '',
      courseType: '',
      noBacklogs: true,
      skillsLearned: '',
    }
  );

  const [errors, setErrors] = useState([]);
  const fieldIsDegree = formData.type === 'Bachelors' || formData.type === 'Masters';

  const validateForm = () => {
    const newErrors = [];
    if (!formData.type) newErrors.push('Education type is required');
    if (fieldIsDegree) {
      if (!formData.degree) newErrors.push('Degree is required');
      if (!formData.collegeName) newErrors.push('College name is required');
      if (!formData.universityName) newErrors.push('University name is required');
    } else {
      if (!formData.schoolName) newErrors.push('School name is required');
      if (!formData.boardName) newErrors.push('Board name is required');
    }
    if (!formData.startYear) newErrors.push('Start year is required');
    if (!formData.current && !formData.endYear) newErrors.push('End year is required');
    if (formData.current && !formData.expectedGraduationYear) newErrors.push('Expected graduation year is required');
    if (!formData.gradingSystem) newErrors.push('Grading system is required');
    if (!formData.courseType) newErrors.push('Course type is required');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      setFormData({
        _id: `temp-${Date.now()}`,
        type: '',
        degree: '',
        collegeName: '',
        universityName: '',
        schoolName: '',
        boardName: '',
        courseName: '',
        startYear: '',
        endYear: '',
        current: false,
        expectedGraduationYear: '',
        gradingSystem: '',
        cgpa: '',
        percentage: '',
        courseType: '',
        noBacklogs: true,
        skillsLearned: '',
      });
      setErrors([]);
    }
  };

  const handleClose = () => {
    setFormData({
      _id: `temp-${Date.now()}`,
      type: '',
      degree: '',
      collegeName: '',
      universityName: '',
      schoolName: '',
      boardName: '',
      courseName: '',
      startYear: '',
      endYear: '',
      current: false,
      expectedGraduationYear: '',
      gradingSystem: '',
      cgpa: '',
      percentage: '',
      courseType: '',
      noBacklogs: true,
      skillsLearned: '',
    });
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-amber-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-400">Education</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {editingEntry ? 'Edit Education' : 'Add Your Education'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {editingEntry
                  ? 'Update your educational qualifications'
                  : 'Adding your educational details help recruiters know your value as a potential candidate'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full border border-white/10 bg-slate-900/80 p-2.5 text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
            >
              <IconX size={20} />
            </button>
          </div>

          <div className="mt-8 space-y-6">
            {/* Education Type Selector */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.24em] text-amber-300 mb-3">
                Highest qualification/Degree pursuing
              </label>
              <div className="flex flex-wrap gap-3">
                {educationTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type, degree: '' })}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      formData.type === type
                        ? 'border-amber-400 border-2 bg-amber-500/20 text-amber-200'
                        : 'border border-white/20 bg-slate-900/50 text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    {type}
                    {formData.type === type && <IconCheck className="ml-1 inline" size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Name */}
            {formData.type && (
              <input
                type="text"
                placeholder="Course name"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
              />
            )}

            {/* Degree Selection for Bachelors/Masters */}
            {fieldIsDegree && (
              <select
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
              >
                <option value="">Select degree</option>
                {(formData.type === 'Bachelors' ? bachelorDegrees : masterDegrees).map((deg) => (
                  <option key={deg} value={deg}>
                    {deg}
                  </option>
                ))}
              </select>
            )}

            {/* College/School Names */}
            {fieldIsDegree ? (
              <>
                <input
                  type="text"
                  placeholder="College name"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
                />
                <input
                  type="text"
                  placeholder="University name"
                  value={formData.universityName}
                  onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="School name"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
                />
                <input
                  type="text"
                  placeholder="Board name"
                  value={formData.boardName}
                  onChange={(e) => setFormData({ ...formData, boardName: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
                />
              </>
            )}

            {/* Years Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Starting year
                </label>
                <select
                  value={formData.startYear}
                  onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
                >
                  <option value="">Select year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  {formData.current ? 'Expected graduation year' : 'Ending year'}
                </label>
                <select
                  value={formData.current ? formData.expectedGraduationYear : formData.endYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [formData.current ? 'expectedGraduationYear' : 'endYear']: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
                >
                  <option value="">Select year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grading System */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.24em] text-amber-300 mb-3">
                Grading system
              </label>
              <div className="grid grid-cols-2 gap-3">
                {gradingSystems.map((system) => (
                  <button
                    key={system}
                    type="button"
                    onClick={() => setFormData({ ...formData, gradingSystem: system })}
                    className={`rounded-2xl px-3 py-2.5 text-xs font-medium transition ${
                      formData.gradingSystem === system
                        ? 'border-amber-400 border-2 bg-amber-500/20 text-amber-200'
                        : 'border border-white/20 bg-slate-900/50 text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    {system}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Input */}
            {formData.gradingSystem && (
              <input
                type="text"
                placeholder={
                  formData.gradingSystem.includes('%')
                    ? 'Enter percentage (0-100)'
                    : formData.gradingSystem.includes('Scale 4')
                    ? 'Enter CGPA (0-4)'
                    : 'Enter CGPA (0-10)'
                }
                value={formData.cgpa || formData.percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [formData.gradingSystem.includes('%') ? 'percentage' : 'cgpa']: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
              />
            )}

            {/* Course Type */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.24em] text-amber-300 mb-3">
                Course type
              </label>
              <div className="flex flex-wrap gap-3">
                {courseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, courseType: type })}
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      formData.courseType === type
                        ? 'border-amber-400 border-2 bg-amber-500/20 text-amber-200'
                        : 'border border-white/20 bg-slate-900/50 text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Learned */}
            {fieldIsDegree && (
              <input
                type="text"
                placeholder="Skills learned (optional)"
                value={formData.skillsLearned}
                onChange={(e) => setFormData({ ...formData, skillsLearned: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:bg-slate-900/90"
              />
            )}

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 cursor-pointer transition hover:border-amber-400/30">
                <input
                  type="checkbox"
                  checked={formData.noBacklogs}
                  onChange={(e) => setFormData({ ...formData, noBacklogs: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-amber-400"
                />
                <span className="text-sm text-slate-300">No active backlogs</span>
              </label>
              {fieldIsDegree && (
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 cursor-pointer transition hover:border-amber-400/30">
                  <input
                    type="checkbox"
                    checked={formData.current}
                    onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-amber-400"
                  />
                  <span className="text-sm text-slate-300">Currently pursuing</span>
                </label>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p className="text-sm font-semibold text-rose-200">Please fix the following:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-200">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-3 font-semibold text-slate-300 transition hover:border-white/30 hover:bg-slate-900/60"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-950 transition hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-2"
              >
                <IconCheck size={18} /> {editingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
