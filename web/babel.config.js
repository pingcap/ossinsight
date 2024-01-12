module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  plugins: [
    [
      'babel-plugin-direct-import',
      {
        modules: [
          '@mui/system',
          '@mui/material',
          '@mui/icons-material',
          '@djagger/echartsx',
        ],
      },
    ],
  ]
};
