import React from 'react';
import { Badge } from 'react-bootstrap';

const NotificationBadge = ({ count }) => {
  return (
    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
      {count}
    </Badge>
  );
};

export default NotificationBadge;
