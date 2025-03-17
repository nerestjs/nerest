import type { HeaderProps } from './schema';

export default async (props: HeaderProps) => {
  return {
    ...props,
    affirmation: 'You are awesome!',
  };
};
