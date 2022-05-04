import React from 'react';
import {useCallback, useContext, useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import {EChartsContext} from '../ECharts';
import CommonChartContext from '../CommonChart/context';
import ShareButtons from '../ShareButtons';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TwitterCard from './TwitterCard';
import {useShare} from './hooks';
import ShareUrl from './ShareUrl';

export interface ShareDialogProps {
  open: boolean,
  onClose: () => any
}

export const ShareDialog = ({open, onClose}: ShareDialogProps) => {
  const {echartsRef} = useContext(EChartsContext);
  const {shareInfo} = useContext(CommonChartContext);
  const [imgData, setImgData] = useState<string>();
  const {share, sharing, shareId, title, description, message, keyword} = useShare(shareInfo, echartsRef);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<unknown | undefined>(undefined)

  useEffect(() => {
    if (open) {
      share().then(() => setError(undefined)).catch(setError);
      const canvas = echartsRef?.current?.ele?.getElementsByTagName('canvas')?.[0];
      if (canvas) {
        let eci = echartsRef?.current?.getEchartsInstance();
        const { toolbox } = eci.getOption()
        // hide toolbox
        eci.setOption({ toolbox: { show: false } })
        setImgData(canvas.toDataURL('image/jpeg'));
        eci.setOption({ toolbox })
      }
    }
  }, [open]);

  const handleCloseSnackbar = useCallback(() => {
    setCopied(false);
  }, []);

  const fullUrl = `https://api.ossinsight.io/share/${shareId}`;

  return (
    <form>
      <Snackbar
        open={copied}
        onClose={handleCloseSnackbar}
        autoHideDuration={3000}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{width: '100%'}}>
          URL Copied!
        </Alert>
      </Snackbar>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth={true}
        onClose={onClose}
      >
        <Box sx={{margin: 'auto', maxWidth: '504px', px: 2, pt: 2, width: '100%'}}>
          <TwitterCard title={title} description={description} imgData={imgData} />
          <Box sx={{my: 2}}>
            {shareId
              ? (
                <>
                  <ShareUrl url={fullUrl} onCopy={() => setCopied(true)} />
                  <ShareButtons shareUrl={fullUrl} title={message || title} hashtags={keyword} />
                </>
              ) : error
                ? <Alert severity='error'>Request failed ${(error as any)?.message ?? ''}</Alert>
                : (<Skeleton />)}
            <Box sx={{my: 2}}>
              <small>This site is protected by reCAPTCHA and the Google
                <a href="https://policies.google.com/privacy">Privacy Policy</a> and
                <a href="https://policies.google.com/terms">Terms of Service</a> apply.
              </small>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </form>
  );
};

export default ShareDialog;
