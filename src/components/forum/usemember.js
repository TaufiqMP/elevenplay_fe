'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

//Sesi login di browser. ready = false selama sesi masih dicek
export function useMember() {
  const [state, setState] = useState({ ready: false, user: null });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ ready: true, user: data.session?.user ?? null });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ ready: true, user: session?.user ?? null });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
