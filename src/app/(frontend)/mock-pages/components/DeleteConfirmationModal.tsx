'use client'

import React from 'react'

interface DeleteConfirmationModalProps {
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isDeleting?: boolean
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="warning-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button type="button" className="cancel-button" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="delete-button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <span className="deleting-text">
                <span className="spinner"></span>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
