import React from "react";

import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface GithubOwner {
  owner: {
    avatar_url: string
    html_url: string
    login: string
  }
  size?: number | string
}

const Owner = ({owner, size = '1em'}: GithubOwner) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{alignItems: 'center'}}
      component='a'
      href={owner.html_url}
      target='_blank'
    >
      <Avatar
        alt={owner.login}
        src={owner.avatar_url}
        sx={{width: size, height: size}}
      />
      <Typography>
        {owner.login}
      </Typography>
    </Stack>
  )
}

Owner.displayName = 'GithubOwner'

export default Owner
