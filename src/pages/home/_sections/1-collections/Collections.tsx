import React, { PropsWithChildren, useEffect, useRef } from "react";
import { RecentHotCollectionData, useRecentHotCollections } from "./hook";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Diff from "../../../../components/Diff";
import Link from "@docusaurus/Link";
import Avatar from "@mui/material/Avatar";
import { paramCase } from "param-case";
import { useScrollable } from "./useScrollable";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Skeleton from "@mui/material/Skeleton";

export default function Collections() {
  const { data } = useRecentHotCollections();
  const version = useRef(0)

  return (
    <CollectionsContainer version={++version.current}>
      {data?.data.map(collection => (
        <Collection key={collection.id} {...collection} />
      ))}
      {!data ? <Loading /> : undefined}
    </CollectionsContainer>
  );
}

const Loading = () => {
  return (
    <>
      <LoadingCollection />
      <LoadingCollection />
      <LoadingCollection />
    </>
  );
};

const CollectionsContainer = ({ version, children }: PropsWithChildren<{ version: number }>) => {
  const { ref, scrollable, scroll, recompute } = useScrollable({ direction: 'x' });

  useEffect(() => {
    recompute()
  }, [version])

  return (
    <Box position="relative">
      <ScrollIndicator type="backward" onClick={() => scroll(-0.6)} show={!!scrollable && scrollable !== 'forward'} />
      <ScrollIndicator type="forward" onClick={() => scroll(0.6)} show={!!scrollable && scrollable !== 'backward'} />
      <Stack direction="row" overflow="auto" ref={ref}>
        {children}
      </Stack>
    </Box>
  );
};

type ScrollIndicatorProps = { type: 'forward' | 'backward', onClick: () => void, show: boolean }
const ScrollIndicator = ({ type, onClick, show }: ScrollIndicatorProps) => {
  return (
    <Box
      sx={{
        transition: 'opacity .2s ease',
        cursor: 'pointer',
        opacity: show ? 1 : 0,
        pointerEvents: show ? undefined : 'none',
        zIndex: 1,
      }}
      position="absolute"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="24px"
      top={0}
      left={type === 'backward' ? 0 : undefined}
      right={type === 'forward' ? 0 : undefined}
      onClick={onClick}
      bgcolor="#2c2c2c"
      border="2px dashed #3c3c3c"
      fontSize={36}
    >
      {type === 'forward' ? <ArrowRightIcon fontSize="inherit" /> : <ArrowLeftIcon fontSize="inherit" />}
    </Box>
  );
};

function LoadingCollection() {
  return (
    <Box border="2px dashed #3c3c3c" p={2} borderRadius={1} sx={{ '&:not(:first-child)': { ml: 2 } }}>
      <Skeleton width={150} />
      <Skeleton width={160} sx={{mt: 2}} />
      <Skeleton width={120} sx={{my: 2}} />
      {[0, 1, 2].map(i => (
        <Stack key={i} direction="row">
          <Skeleton width={48} />
          <Skeleton width={36} height={36} variant="circular" sx={{ mx: 1 }} />
          <Skeleton width={120} />
        </Stack>
      ))}
    </Box>
  );
}

function Collection({ name, repos, collectionRepos }: RecentHotCollectionData) {
  return (
    <Box border="2px dashed #3c3c3c" p={2} borderRadius={1} sx={{ '&:not(:first-child)': { ml: 2 } }}>
      <Typography variant="body1" fontSize={16}>{name}</Typography>
      <Typography variant="body2" color="#7C7C7C" mt={2} mb={2}>{repos} repositories</Typography>

      {collectionRepos.map(repo => (
        <Stack key={repo.repo_id} direction="row" mt={1} alignItems="center">
          <Box maxWidth={48} minWidth={48}>
            {repo.rank}
            <Diff val={repo.rank_changes} />
          </Box>
          <Box>
            <Link href={`/analyze/${repo.repo_name}`} target='_blank'>
              <Stack direction="row" alignItems="center">
              <Box component='span' display='inline-flex' bgcolor='lightgrey' borderRadius='24px' padding='0px' alignItems='center' justifyContent='center' sx={{ verticalAlign: 'text-bottom'}} mr={1}>
                <Avatar src={`https://github.com/${repo.repo_name.split('/')[0]}.png`} />
                </Box>
                <Box component="span" whiteSpace="nowrap" ml={1}>
                  {repo.repo_name}
                </Box>
              </Stack>
            </Link>
          </Box>
        </Stack>
      ))}

      <Box mt={2} fontSize={14}>
        <Link href={`/collections/${paramCase(name)}`} target='_blank'>
          &gt; See All
        </Link>
      </Box>
    </Box>
  );
}

