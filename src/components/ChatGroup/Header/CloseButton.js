import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/* Style-Wrapper */
const CloseButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.6;
  font-weight: 600;
  padding: 0 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 90px;
`;
/* Component */
const CloseButton = (props) => {
  const { handleClickCloseChatGroupButton } = props;
  return (
    <CloseButtonWrapper onClick={() => handleClickCloseChatGroupButton()}>
      닫기
    </CloseButtonWrapper>
  );
};

CloseButton.propTypes = {
  handleClickCloseChatGroupButton: PropTypes.func.isRequired,
};

export default CloseButton;
