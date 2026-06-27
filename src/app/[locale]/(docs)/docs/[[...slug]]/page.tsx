import { notFound } from 'next/navigation';
import type { ComponentProps, ComponentType } from 'react';
import { getMDXComponents } from '@/mdx-components';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';

import { source } from '@/core/docs/source';

type DocsPageData = {
  body: ComponentType<{ components?: ReturnType<typeof getMDXComponents> }>;
  toc?: ComponentProps<typeof DocsPage>['toc'];
  full?: ComponentProps<typeof DocsPage>['full'];
  title?: string;
  description?: string;
};

export const revalidate = 86400;
export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function DocsContentPage(props: {
  params: Promise<{ slug?: string[]; locale?: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.locale);

  if (!page) notFound();

  const data = page.data as DocsPageData;
  const MDXContent = data.body;

  return (
    <DocsPage
      toc={data.toc}
      full={data.full}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams('slug', 'locale');
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; locale?: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.locale);
  if (!page) notFound();

  return {
    title: (page.data as DocsPageData).title,
    description: (page.data as DocsPageData).description,
  };
}
