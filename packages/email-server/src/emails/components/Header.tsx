import { MjmlColumn, MjmlImage, MjmlSection } from 'mjml-react';

type HeaderProps = {
  loose?: boolean;
};

const Header: React.FC<HeaderProps> = ({ loose }) => {
  return (
    <MjmlSection padding={loose ? '48px 0 40px' : '48px 0 24px'}>
      <MjmlColumn>
        <MjmlImage
          padding="0 24px 0"
          width="129px"
          height="54px"
          align="center"
          src="https://user-images.githubusercontent.com/5086433/199859578-510462ba-bcc3-4b14-8c09-01383546483e.png"
          cssClass="logo"
        />
      </MjmlColumn>
    </MjmlSection>
  );
};

export default Header;
