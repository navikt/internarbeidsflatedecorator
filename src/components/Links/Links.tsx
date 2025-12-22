import { Link } from '@navikt/ds-react';
import React from 'react';
import useGlobalHandlers from '../../store/GlobalHandlers';
import type {
  LinkSection,
  LinkSections,
  LinkWithTitle,
} from './useGenerateLinks';

export const DecoratorLinks: React.FC<LinkSections> = (links) => {
  return (
    <div className="dr:max-w-6xl dr:mr-auto dr:ml-auto dr:p-4 dr:text-left">
      <div className="dr:flex dr:flex-wrap dr:mb-4">
        <Column linkSection={links.modia} />
        <Column linkSection={links.arbeidsrettet} />
        <Column linkSection={links.sykefravaer} />
      </div>
      <Row linkSection={links.andre} />
    </div>
  );
};

export const FullScreenLinks: React.FC<LinkSections> = (links) => {
  return (
    <div className="dr:max-w-6xl dr:mr-auto dr:ml-auto dr:p-8 dr:text-left dr:grid dr:grid-cols-1 dr:sm:grid-cols-3 dr:gap-y-8">
      <Column linkSection={links.modia} />
      <Column linkSection={links.arbeidsrettet} />
      <Column linkSection={links.sykefravaer} />
      <div className="dr:sm:col-span-3">
        <Row linkSection={links.andre} />
      </div>
    </div>
  );
};

const Column: React.FC<{ linkSection: LinkSection }> = ({ linkSection }) => {
  return (
    <section className="dr:min-w-[25%] dr:px-6">
      <h2 className="dr:font-bold dr:border-white dr:border-solid dr:border-b dr:mb-2 dr:pb-1">
        {linkSection.title}
      </h2>
      <ul>
        {linkSection.links.map((link: LinkWithTitle) => {
          const href = `${link.url}${link.subPath}`;
          return (
            <LinkComponent
              key={href}
              href={href}
              newPage={linkSection.newPage}
              linkText={link.title}
            />
          );
        })}
      </ul>
    </section>
  );
};

const Row: React.FC<{ linkSection: LinkSection }> = ({ linkSection }) => {
  return (
    <section className="dr:px-6">
      <h2 className="dr:font-bold dr:border-white dr:border-solid dr:border-b dr:mb-2">
        {linkSection.title}
      </h2>
      <ul className="dr:flex dr:flex-wrap dr:gap-x-8">
        {linkSection.links.map((link: LinkWithTitle) => {
          const href = `${link.url}${link.subPath}`;
          return (
            <LinkComponent
              key={href}
              href={href}
              newPage={linkSection.newPage}
              linkText={link.title}
            />
          );
        })}
      </ul>
    </section>
  );
};

const LinkComponent: React.FC<{
  href: string;
  newPage?: boolean | undefined;
  linkText: string;
}> = ({ href, linkText, newPage = false }) => {
  const onLinkClick = useGlobalHandlers((state) => state.onLinkClick);
  const onClick = () => {
    onLinkClick?.(linkText, href);
  };

  const trackOutBound = window.location.host != new URL(href).host;
  const umamiOutboundLink = trackOutBound
    ? { 'data-umami-event-url': href.replace(/fnr=\d+/, '/fnr=*****') }
    : {};

  return (
    <li className="dr:block dr:text-white dr:py-0.5">
      <Link
        href={href}
        target={newPage ? '_blank' : '_self'}
        className="dr:block! dr:text-white! dr:no-underline! dr:focus:outline-hidden! dr:focus:ring! dr:focus:ring-orange-400! dr:focus:bg-transparent! dr:hover:text-orange-400! dr:hover:before:w-2! dr:hover:before:h-2! dr:hover:before:-mr-2! dr:hover:before:bg-orange-400! dr:hover:before:rounded-full! dr:hover:before:inline-block! dr:hover:before:-left-4! dr:hover:before:relative! dr:hover:before:mb-[2px]! dr:hover:visited:text-orange-400!"
        onClick={onClick}
        data-umami-event="lenke klikket"
        {...umamiOutboundLink}
      >
        {linkText}
      </Link>
    </li>
  );
};
