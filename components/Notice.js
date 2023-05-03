import React from 'react';
import {Paragraph, Theme, XStack, styled} from 'tamagui';

import {unwrapText} from './unwrapText';

export const Notice = ({
  children,
  theme = 'red',
  disableUnwrap,
  ...props
}) => {
  return (
    <NoticeFrame theme={theme} {...props}>
      <Paragraph
        py="$2"
        theme="alt1"
        className="paragraph-parent">
        {disableUnwrap ? children : unwrapText(children)}
      </Paragraph>
    </NoticeFrame>
  );
};

export const NoticeFrame = styled(XStack, {
  className: 'no-opacity-fade',
  borderWidth: 1,
  borderColor: '$borderColor',
  p: '$4',
  py: '$2',
  bc: '$background',
  br: '$4',
  space: '$3',
  my: '$1',
  pos: 'relative',
  elevation: "$1"
});
