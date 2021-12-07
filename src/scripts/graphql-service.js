/**
 * Copyright (c) 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fetch from 'cross-fetch';
import dotenv from 'dotenv';
import createHttpsProxyAgent from 'https-proxy-agent';

dotenv.config();

function extractRequiredPeopleFields(queryResult) {
  const result = { announcement: {}, people: [] };

  result.slug = queryResult.data.getPeoplePage.slug;
  result.name = queryResult.data.getPeoplePage.name;
  const base = queryResult.data.getPeoplePage.fields;
  if (base.announcement) {
    result.announcement = base.announcement.fields;
  }
  if (base.people) {
    result.people = base.people;
  }
  return result;
}

export default async function fetchPeopleData(peopleSlug) {
  try {
    const channelToken = `${process.env.CHANNEL_TOKEN}`;
    const fetchParams = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
      {
        getPeoplePage(slug: "${peopleSlug}", channelToken: "${channelToken}" ) {
          id
          slug
          name
          fields {
            announcement {
              id
              fields {
                type: fieldType
                heading
                body
                actions
                image {
                  ...sectionImages
                }
              }
            }
            people {
              id
              fields {
                fullname
                title
                biodata
                file {
                  metadata {
                    width
                    height
                  }
                }
                renditions {
                  name
                  format
                  file {
                    url
                    metadata {
                      height
                      width
                    }
                  }
                }
              }
            }
          }
        }
      }
      fragment sectionImages on image {
        id
        fields {
          file {
            metadata {
              width
              height
            }
          }
          renditions {
            name
            format
            file {
              url
              metadata {
                height
                width
              }
            }
          }
        }
      }
      `,
      }),
    };

    // Figure out if we need a proxy. Only needed on server-side render
    if (typeof window === 'undefined' && typeof process === 'object') {
      const proxyServer = process.env.SERVER_URL.startsWith('https')
        ? process.env.oce_https_proxy : process.env.oce_https_proxy;
      if (proxyServer) {
        const proxy = createHttpsProxyAgent(proxyServer);
        fetchParams.agent = proxy;
      }
    }

    const response = await fetch(`${process.env.SERVER_URL}/content/published/api/v1.1/graphql`, fetchParams);
    const queryResult = await response.json();
    return extractRequiredPeopleFields(queryResult);
  } catch (error) {
    console.log(error);
    return ('');
  }
}
