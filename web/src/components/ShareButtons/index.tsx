import React, { CSSProperties, useMemo } from 'react';
import {
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';

const size = 32;

interface ShareButtonsProps {
  disabled?: boolean;
  shareUrl?: string;
  title: string;
  hashtags?: string[];
  style?: CSSProperties;
}

const ShareButtons = ({ shareUrl, disabled = false, title, hashtags, style }: ShareButtonsProps) => {
  const { siteConfig } = useDocusaurusContext();
  const { location, createHref } = useHistory();

  const url = useMemo(() => {
    return shareUrl ?? (siteConfig.url + createHref(location));
  }, [shareUrl, location]);

  return (
    <div className={styles.shareButtons} style={style}>
      <TwitterShareButton url={url} title={title} hashtags={hashtags}>
        <TwitterIcon round size={size} />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon round size={size} />
      </LinkedinShareButton>
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon round size={size} />
      </TelegramShareButton>
      <RedditShareButton url={url} title={title}>
        <RedditIcon round size={size} />
      </RedditShareButton>
    </div>
  );
};

export default ShareButtons;
