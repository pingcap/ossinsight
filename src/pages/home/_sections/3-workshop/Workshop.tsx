import React from "react";
import { styled } from "@mui/material/styles";
import Stack, { StackProps } from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "../../../../components/Link";
import DLink from '@docusaurus/Link';
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

const links: { title: string, href: string }[] = [
  { title: 'mini OSS Insight', href: '/workshop/mini-ossinsight/introduction' },
  { title: 'Twitter Insight', href: '/workshop/twitter-insight' },
  { title: 'Stack Overflow Insight', href: '/workshop/stackoverflow-insight' },
  { title: 'Cryptocurrency Insight', href: '/workshop/cryptocurrency-insight' },
];

export default function Workshop() {
  return (
    <Stack direction={['column', 'column', 'row']}>
      <Card>
        <List>
          {links.map(({ title, href }) => (
            <ListItem key={href} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">
                {title}
              </Typography>
              <DLink href={href} target='_blank' >
                &gt;&nbsp;Join
              </DLink>
            </ListItem>
          ))}
        </List>
      </Card>
      <Box minWidth={36} maxWidth={36} minHeight={36} maxHeight={36} />
      <Card>
        <Stack justifyContent="space-between" alignItems="start" minHeight={140}>
          <Typography variant="body1">
            If you want a further talk about OSS Insight,
            <br />
            please join our offline workshop, you may get help there.
          </Typography>
          <Button variant="contained" color="primary" component={Link} href="https://share.hsforms.com/1E-qtGQWrTVmctP8kBT34gw2npzm" target='_link'>
            🗓️ Join Offline Workshop
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

const Card = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
  borderRadius: theme.spacing(0.75),
  border: '1px solid rgba(124, 124, 124, 0.3)',
  minHeight: 204,
}));

const List = styled('ul')(({ theme }) => ({
  padding: 0,
  margin: 0,
  listStyle: 'none',
}));

const ListItem = styled((props: StackProps<'li'>) => <Stack {...props} component="li" />)(({ theme }) => ({
  margin: 0,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));
