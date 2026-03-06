import { FC, ReactElement, ReactNode } from 'react';
import Once from './Once'

export interface IfProps {
  once?: boolean
  cond?: boolean;
  then?: ReactNode | (() => ReactNode);
  else?: ReactNode | (() => ReactNode);
}

function render (node: ReactNode | (() => ReactNode) | undefined): ReactNode {
  if (!node) {
    return null
  }
  if (typeof node === 'function') {
    return node()
  } else {
    return node
  }
}

const If: FC<IfProps> = function If({ once = false, cond, then: themNode, else: elseNode }: IfProps): ReactElement {
  let child: ReactNode
  if (cond) {
    child = render(themNode)
  } else {
    child = render(elseNode)
  }
  if (once) {
    return <Once key={cond ? 'then' : 'else'}>{child}</Once>
  } else {
    return <>{child}</>
  }
}

If.displayName = 'If'

export default If
