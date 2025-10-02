import React, { useState, useRef, useEffect } from 'react';
import ProfilePreview from './ProfilePreview';
import { Link } from 'react-router-dom';

/**
 * ProfilePopover: wraps children and shows a small hover/focus card with profile info.
 * Props:
 *  - user: user object
 *  - delay (optional) hide delay
 */
const ProfilePopover = ({ user, children, delay = 200 }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef();
  const triggerRef = useRef();
  const popRef = useRef();

  const show = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), delay);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <span className="profile-pop-wrapper" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} ref={triggerRef}>
      {children}
      {open && user && (
        <div className="profile-popover" role="dialog" ref={popRef}>
          <ProfilePreview user={user} showFollow={false} />
          <Link to={`/profile/${user.id}`} className="mini-link">view profile →</Link>
        </div>
      )}
    </span>
  );
};

export default ProfilePopover;
